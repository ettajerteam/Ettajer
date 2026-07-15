import type { Metadata } from "next";
import { EttajerHomePage } from "@/components/landing/ettajer-home-page";
import { LandingLocaleProvider } from "@/components/landing/landing-locale-context";
import { LandingLocaleShell } from "@/components/landing/landing-locale-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { getLandingSeo } from "@/lib/landing/landing-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import { buildHomeGraph } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getLandingSeo(locale),
    path: "/",
    locale,
  });
}

export default async function HomePage() {
  const locale = await getServerLocale();

  return (
    <>
      <JsonLd graph={buildHomeGraph(locale)} />
      <LandingLocaleProvider>
        <LandingLocaleShell>
          <main className="min-h-screen w-full max-w-full overflow-x-hidden">
            <EttajerHomePage />
          </main>
        </LandingLocaleShell>
      </LandingLocaleProvider>
    </>
  );
}
