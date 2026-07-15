import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationSchema } from "@/lib/seo/structured-data";
import { buildRootMetadata, getServerLocale } from "@/lib/seo/page-metadata";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...buildRootMetadata(),
  icons: {
    icon: "/brand/Ettajer-Icon-400x367px.png",
    shortcut: "/brand/Ettajer-Icon-400x367px.png",
    apple: "/brand/App-Logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <JsonLd graph={[buildOrganizationSchema(locale)]} />
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
