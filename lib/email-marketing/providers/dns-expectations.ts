import type {
  EmailDnsRecordExpectation,
  EmailProviderDnsExpectations,
  EmailSendProviderId,
} from "@/lib/email-marketing/providers/types";

function rootDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/\.$/, "");
}

/** Provider-specific DNS guidance for SPF / DKIM / DMARC. */
export function buildProviderDnsExpectations(
  provider: EmailSendProviderId,
  domainInput: string
): EmailProviderDnsExpectations {
  const domain = rootDomain(domainInput);

  const dmarc: EmailDnsRecordExpectation = {
    type: "TXT",
    host: `_dmarc.${domain}`,
    valueIncludes: ["v=dmarc1"],
    recommendedValue: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`,
    purpose: "dmarc",
  };

  switch (provider) {
    case "resend": {
      const spfInclude =
        process.env.EMAIL_RESEND_SPF_INCLUDE?.trim() || "include:amazonses.com";
      const dkimHost =
        process.env.EMAIL_RESEND_DKIM_HOST?.trim() ||
        `resend._domainkey.${domain}`;
      const dkimValue =
        process.env.EMAIL_RESEND_DKIM_VALUE?.trim() ||
        "Ask Resend dashboard for the DKIM CNAME/TXT value";
      return {
        provider,
        docsUrl: "https://resend.com/docs/dashboard/domains/introduction",
        records: [
          {
            type: "TXT",
            host: domain,
            valueIncludes: ["v=spf1", spfInclude.toLowerCase()],
            recommendedValue: `v=spf1 ${spfInclude} ~all`,
            purpose: "spf",
          },
          {
            type: "CNAME",
            host: dkimHost.includes(".") ? dkimHost : `${dkimHost}.${domain}`,
            valueIncludes: [],
            recommendedValue: dkimValue,
            purpose: "dkim",
          },
          dmarc,
        ],
      };
    }
    case "postmark": {
      const spfInclude =
        process.env.EMAIL_POSTMARK_SPF_INCLUDE?.trim() ||
        "include:spf.mtasv.net";
      return {
        provider,
        docsUrl: "https://postmarkapp.com/support/article/1002-how-do-i-verify-a-domain",
        records: [
          {
            type: "TXT",
            host: domain,
            valueIncludes: ["v=spf1", spfInclude.toLowerCase()],
            recommendedValue: `v=spf1 ${spfInclude} ~all`,
            purpose: "spf",
          },
          {
            type: "TXT",
            host:
              process.env.EMAIL_POSTMARK_DKIM_HOST?.trim() ||
              `pm._domainkey.${domain}`,
            valueIncludes: ["k=rsa", "p="],
            recommendedValue:
              process.env.EMAIL_POSTMARK_DKIM_VALUE?.trim() ||
              "Copy DKIM TXT from Postmark Sender Signature",
            purpose: "dkim",
          },
          dmarc,
        ],
      };
    }
    case "sendgrid": {
      const spfInclude =
        process.env.EMAIL_SENDGRID_SPF_INCLUDE?.trim() ||
        "include:sendgrid.net";
      return {
        provider,
        docsUrl: "https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication",
        records: [
          {
            type: "TXT",
            host: domain,
            valueIncludes: ["v=spf1", spfInclude.toLowerCase()],
            recommendedValue: `v=spf1 ${spfInclude} ~all`,
            purpose: "spf",
          },
          {
            type: "CNAME",
            host:
              process.env.EMAIL_SENDGRID_DKIM_HOST?.trim() ||
              `s1._domainkey.${domain}`,
            valueIncludes: [],
            recommendedValue:
              process.env.EMAIL_SENDGRID_DKIM_VALUE?.trim() ||
              "Copy s1/s2 CNAME values from SendGrid Authenticate Domain",
            purpose: "dkim",
          },
          dmarc,
        ],
      };
    }
    case "ses": {
      const spfInclude =
        process.env.EMAIL_SES_SPF_INCLUDE?.trim() || "include:amazonses.com";
      return {
        provider,
        docsUrl: "https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html",
        records: [
          {
            type: "TXT",
            host: domain,
            valueIncludes: ["v=spf1", spfInclude.toLowerCase()],
            recommendedValue: `v=spf1 ${spfInclude} ~all`,
            purpose: "spf",
          },
          {
            type: "CNAME",
            host:
              process.env.EMAIL_SES_DKIM_HOST?.trim() ||
              `selector1._domainkey.${domain}`,
            valueIncludes: [],
            recommendedValue:
              process.env.EMAIL_SES_DKIM_VALUE?.trim() ||
              "Copy Easy DKIM CNAME tokens from AWS SES",
            purpose: "dkim",
          },
          dmarc,
        ],
      };
    }
    default:
      return { provider, records: [dmarc] };
  }
}
