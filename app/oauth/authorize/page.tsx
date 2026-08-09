import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getApplicationByClientId } from "@/lib/developer/oauth";
import { OAuthAuthorizeClient } from "@/components/developer/oauth-authorize-client";

export const dynamic = "force-dynamic";

export default async function OAuthAuthorizePage({
  searchParams,
}: {
  searchParams?: {
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
    response_type?: string;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams ?? {})) {
      if (v) qs.set(k, v);
    }
    redirect(`/login?callbackUrl=${encodeURIComponent(`/oauth/authorize?${qs}`)}`);
  }

  const clientId = searchParams?.client_id ?? "";
  const app = clientId ? await getApplicationByClientId(clientId) : null;
  const store = await prisma.store.findFirst({
    where: { userId: session!.user!.id },
    select: { name: true },
  });

  return (
    <div className="min-h-screen bg-[#F2F2F7] px-4 py-16">
      <Suspense fallback={<p className="text-center text-sm">Loading…</p>}>
        {app && store ? (
          <OAuthAuthorizeClient appName={app.name} storeName={store.name} />
        ) : (
          <p className="mx-auto max-w-lg text-center text-sm text-muted-foreground">
            {!app
              ? "Unknown or inactive application."
              : "Create a store before authorizing developer apps."}
          </p>
        )}
      </Suspense>
    </div>
  );
}
