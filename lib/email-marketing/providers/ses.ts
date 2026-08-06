import { createHash, createHmac } from "crypto";
import { buildProviderDnsExpectations } from "@/lib/email-marketing/providers/dns-expectations";
import type {
  EmailSendAdapter,
  EmailSendMessage,
  EmailSendResult,
} from "@/lib/email-marketing/providers/types";

/**
 * Amazon SES via the SES v2 HTTPS API (SigV4).
 * Requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION (or SES_* aliases).
 */
function getSesConfig() {
  const accessKeyId =
    process.env.SES_ACCESS_KEY_ID?.trim() ||
    process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey =
    process.env.SES_SECRET_ACCESS_KEY?.trim() ||
    process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const region =
    process.env.SES_REGION?.trim() ||
    process.env.AWS_REGION?.trim() ||
    "eu-west-1";
  return { accessKeyId, secretAccessKey, region };
}

function getFrom(): string {
  return process.env.EMAIL_FROM ?? "Ettajer <noreply@ettajer.com>";
}

function sha256(data: string | Buffer) {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string) {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function getSignatureKey(
  key: string,
  dateStamp: string,
  region: string,
  service: string
) {
  const kDate = hmac(`AWS4${key}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

async function sesSendRaw(input: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
  headers?: Record<string, string>;
}): Promise<EmailSendResult> {
  const { accessKeyId, secretAccessKey, region } = getSesConfig();
  if (!accessKeyId || !secretAccessKey) {
    return {
      success: false,
      error: "SES credentials not configured",
      retryable: true,
      provider: "ses",
    };
  }

  const host = `email.${region}.amazonaws.com`;
  const endpoint = `https://${host}/v2/email/outbound-emails`;
  const bodyObj: Record<string, unknown> = {
    FromEmailAddress: input.from,
    Destination: { ToAddresses: input.to },
    Content: {
      Simple: {
        Subject: { Data: input.subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: input.html, Charset: "UTF-8" },
        },
      },
    },
  };
  if (input.replyTo) {
    bodyObj.ReplyToAddresses = [input.replyTo];
  }
  if (input.headers && Object.keys(input.headers).length) {
    bodyObj.EmailTags = Object.entries(input.headers)
      .slice(0, 10)
      .map(([Name, Value]) => ({ Name: Name.slice(0, 256), Value: Value.slice(0, 256) }));
  }

  const body = JSON.stringify(bodyObj);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const service = "ses";
  const canonicalUri = "/v2/email/outbound-emails";
  const canonicalQuerystring = "";
  const payloadHash = sha256(body);
  const canonicalHeaders =
    `content-type:application/json\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";
  const canonicalRequest = [
    "POST",
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(
    secretAccessKey,
    dateStamp,
    region,
    service
  );
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: host,
        "X-Amz-Date": amzDate,
        Authorization: authorization,
      },
      body,
    });
    const data = (await res.json().catch(() => ({}))) as {
      MessageId?: string;
      message?: string;
    };
    if (!res.ok) {
      return {
        success: false,
        error: data.message || `SES HTTP ${res.status}`,
        retryable: res.status >= 500 || res.status === 429,
        provider: "ses",
      };
    }
    return {
      success: true,
      id: data.MessageId,
      provider: "ses",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "SES send failed",
      retryable: true,
      provider: "ses",
    };
  }
}

export const sesSendAdapter: EmailSendAdapter = {
  id: "ses",
  label: "Amazon SES",
  docsUrl: "https://docs.aws.amazon.com/ses/",
  isConfigured: () => {
    const cfg = getSesConfig();
    return Boolean(cfg.accessKeyId && cfg.secretAccessKey);
  },
  getStatus(input) {
    const configured = Boolean(
      getSesConfig().accessKeyId && getSesConfig().secretAccessKey
    );
    return {
      id: "ses",
      label: "Amazon SES",
      configured,
      active: false,
      health: configured ? "configured" : "missing_credentials",
      webhookPath: "/api/webhooks/email/ses",
      webhookRegistered: Boolean(input?.webhookRegistered),
      envHints: [
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_REGION",
        "SES_WEBHOOK_SECRET",
        "EMAIL_FROM",
      ],
      docsUrl: "https://docs.aws.amazon.com/ses/",
    };
  },
  async send(message: EmailSendMessage): Promise<EmailSendResult> {
    return sesSendRaw({
      from: message.from ?? getFrom(),
      to: Array.isArray(message.to) ? message.to : [message.to],
      subject: message.subject,
      html: message.html,
      replyTo: Array.isArray(message.replyTo)
        ? message.replyTo[0]
        : message.replyTo,
      headers: message.headers,
    });
  },
  getDnsExpectations(domain) {
    return buildProviderDnsExpectations("ses", domain);
  },
};
