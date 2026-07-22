"use client";

import Link from "next/link";
import { Mail, ArrowUp, type LucideIcon } from "lucide-react";
import { HelpMobileHeader } from "@/components/help/help-mobile-ui";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import {
  getLegalDocCopy,
  getLegalLastUpdated,
  getLegalSections,
  getLegalVersion,
  type LegalDocKind,
} from "@/lib/legal/legal-i18n";
import type { CookiesSection } from "@/lib/legal/cookies-sections";
import { SUPPORT_MAILTO } from "@/lib/constants/support";
import { cn } from "@/lib/utils";

type LegalDocumentPageProps = {
  kind: LegalDocKind;
  icon: LucideIcon;
  iconWrapClassName: string;
  ctaPrimaryClassName: string;
  relatedLinks: {
    privacy?: boolean;
    terms?: boolean;
    cookies?: boolean;
    help?: boolean;
    contact?: boolean;
  };
  ctaSecondaryHref: string;
  articlePrefix?: React.ReactNode;
};

export function LegalDocumentPage({
  kind,
  icon: Icon,
  iconWrapClassName,
  ctaPrimaryClassName,
  relatedLinks,
  ctaSecondaryHref,
  articlePrefix,
}: LegalDocumentPageProps) {
  const { locale } = useLandingLocale();
  const doc = getLegalDocCopy(locale, kind);
  const sections = getLegalSections(locale, kind);
  const version = getLegalVersion(kind);
  const lastUpdated = getLegalLastUpdated(locale, kind);

  return (
    <>
      <section className="border-b border-black/[0.04] bg-[#F2F2F7] md:border-neutral-200 md:bg-neutral-50">
        <div className="mx-auto max-w-6xl px-3 py-12 md:px-6 md:py-20">
          <div className="mx-auto max-w-3xl md:text-center">
            <div
              className={cn(
                "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white md:mx-auto md:mb-6",
                iconWrapClassName,
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <HelpMobileHeader eyebrow={doc.eyebrow} title={doc.title} subtitle={doc.subtitle} />
            <p className="mt-5 text-[14px] text-[#8E8E93] md:text-sm md:text-neutral-500">
              {doc.versionLine(version, lastUpdated)}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-3 md:flex-row md:items-start md:gap-12 md:px-6">
          <aside className="md:sticky md:top-24 md:w-64 md:shrink-0">
            <div className="rounded-[0.875rem] border border-[#E5E5EA] bg-[#F2F2F7] p-4 md:rounded-2xl md:border-neutral-200 md:bg-neutral-50 md:p-5">
              <p className="text-[12px] font-bold uppercase tracking-wide text-[#8E8E93]">
                {doc.onThisPage}
              </p>
              <nav className="mt-3 max-h-[50vh] overflow-y-auto overscroll-contain md:max-h-[calc(100vh-8rem)]">
                <ul className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-lg px-2 py-1.5 text-[13px] leading-snug text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900 md:text-sm"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <article className="min-w-0 flex-1 md:max-w-3xl">
            <div className="mb-8 rounded-[0.875rem] border border-[#E5E5EA] bg-[#F2F2F7] p-5 md:rounded-2xl md:border-neutral-200 md:bg-neutral-50 md:p-6">
              <p className="text-[15px] leading-relaxed text-neutral-700 md:text-sm">{doc.intro}</p>
              <p className="mt-3 text-[14px] text-[#8E8E93] md:text-sm md:text-neutral-500">
                {doc.related}{" "}
                {relatedLinks.terms ? (
                  <>
                    <Link href="/terms" className="font-medium text-[#007AFF] hover:underline">
                      {doc.termsLink}
                    </Link>
                    {" · "}
                  </>
                ) : null}
                {relatedLinks.privacy ? (
                  <>
                    <Link href="/privacy" className="font-medium text-[#007AFF] hover:underline">
                      {doc.privacyLink}
                    </Link>
                    {" · "}
                  </>
                ) : null}
                {relatedLinks.cookies ? (
                  <>
                    <Link href="/cookies" className="font-medium text-[#007AFF] hover:underline">
                      {doc.cookiesLink}
                    </Link>
                    {" · "}
                  </>
                ) : null}
                {relatedLinks.help ? (
                  <>
                    <Link href="/help" className="font-medium text-[#007AFF] hover:underline">
                      {doc.helpCenter}
                    </Link>
                    {" · "}
                  </>
                ) : null}
                {relatedLinks.contact ? (
                  <Link href="/contact" className="font-medium text-[#007AFF] hover:underline">
                    {doc.contactSupport}
                  </Link>
                ) : null}
              </p>
            </div>

            {articlePrefix ? <div className="mb-8">{articlePrefix}</div> : null}

            <div className="space-y-10 md:space-y-12">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-[calc(4.5rem+env(safe-area-inset-top))] md:scroll-mt-28"
                >
                  <h2 className="text-[1.25rem] font-bold tracking-tight text-neutral-900 md:text-xl">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-[15px] leading-[1.7] text-neutral-700 md:text-base md:leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.bullets?.length ? (
                    <ul className="mt-4 list-disc space-y-2.5 ps-5">
                      {section.bullets.map((item) => (
                        <li
                          key={item}
                          className="text-[15px] leading-[1.65] text-neutral-700 md:text-base md:leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {"table" in section && (section as CookiesSection).table?.length ? (
                    <LegalCookieTable section={section as CookiesSection} doc={doc} />
                  ) : null}
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-[0.875rem] border border-[#E5E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:rounded-2xl md:border-neutral-200 md:p-6">
              <h2 className="text-[1.1rem] font-bold text-neutral-900 md:text-lg">{doc.ctaTitle}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-600 md:text-sm">
                {doc.ctaBody}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SUPPORT_MAILTO}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-[0.75rem] px-5 py-3 text-[15px] font-semibold text-white transition-colors md:rounded-full md:text-sm",
                    ctaPrimaryClassName,
                  )}
                >
                  <Mail className="h-4 w-4" />
                  {doc.emailSupport}
                </a>
                <Link
                  href={ctaSecondaryHref}
                  className="inline-flex items-center justify-center rounded-[0.75rem] border border-[#E5E5EA] px-5 py-3 text-[15px] font-semibold text-neutral-800 transition-colors hover:bg-[#F2F2F7] md:rounded-full md:text-sm"
                >
                  {doc.ctaSecondary}
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-[#007AFF] md:text-sm"
            >
              <ArrowUp className="h-4 w-4" />
              {doc.backToTop}
            </button>
          </article>
        </div>
      </section>
    </>
  );
}

function LegalCookieTable({
  section,
  doc,
}: {
  section: CookiesSection;
  doc: ReturnType<typeof getLegalDocCopy>;
}) {
  if (!section.table?.length) return null;

  return (
    <div className="mt-5 overflow-x-auto rounded-[0.875rem] border border-[#E5E5EA] md:rounded-2xl md:border-neutral-200">
      <table className="min-w-full divide-y divide-[#E5E5EA] text-start text-[14px] md:text-sm">
        <thead className="bg-[#F2F2F7] md:bg-neutral-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-neutral-900">{doc.tableName}</th>
            <th className="px-4 py-3 font-semibold text-neutral-900">{doc.tablePurpose}</th>
            <th className="px-4 py-3 font-semibold text-neutral-900">{doc.tableDuration}</th>
            <th className="px-4 py-3 font-semibold text-neutral-900">{doc.tableType}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E5EA] bg-white">
          {section.table.map((row) => (
            <tr key={row.name}>
              <td className="px-4 py-3 align-top font-medium text-neutral-900">{row.name}</td>
              <td className="px-4 py-3 align-top text-neutral-700">{row.purpose}</td>
              <td className="px-4 py-3 align-top text-neutral-700">{row.duration}</td>
              <td className="px-4 py-3 align-top text-neutral-700">{row.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
