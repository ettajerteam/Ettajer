import { NextResponse } from "next/server";
import {
  getEmailWebhookAdapter,
  listEmailWebhookProviders,
} from "@/lib/email-marketing/webhooks";
import { ingestEmailEvents } from "@/lib/email-marketing/email-events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: { provider: string };
}

function providerWebhookSecret(provider: string): string | undefined {
  const key = `${provider.toUpperCase()}_WEBHOOK_SECRET`;
  return process.env[key]?.trim() || process.env.EMAIL_WEBHOOK_SECRET?.trim();
}

/**
 * Provider-agnostic email webhook endpoint.
 * POST /api/webhooks/email/resend
 * POST /api/webhooks/email/sendgrid  (register adapter first)
 */
export async function POST(request: Request, { params }: RouteParams) {
  const provider = params.provider?.trim().toLowerCase();
  if (!provider) {
    return NextResponse.json({ message: "Missing provider" }, { status: 400 });
  }

  const adapter = getEmailWebhookAdapter(provider);
  if (!adapter) {
    return NextResponse.json(
      {
        message: `Unknown email webhook provider: ${provider}`,
        supported: listEmailWebhookProviders(),
      },
      { status: 404 }
    );
  }

  const rawBody = await request.text();
  const secret = providerWebhookSecret(provider);

  if (adapter.verify) {
    const ok = await adapter.verify({
      rawBody,
      headers: request.headers,
      secret,
    });
    if (!ok) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: unknown = null;
  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  try {
    const events = await adapter.normalize({
      payload,
      rawBody,
      headers: request.headers,
    });

    if (events.length === 0) {
      return NextResponse.json({ ok: true, created: 0, skipped: 0 });
    }

    const result = await ingestEmailEvents(events);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error(`[webhooks/email/${provider}]`, error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const provider = params.provider?.trim().toLowerCase();
  const adapter = provider ? getEmailWebhookAdapter(provider) : undefined;
  return NextResponse.json({
    provider,
    registered: Boolean(adapter),
    supported: listEmailWebhookProviders(),
  });
}
