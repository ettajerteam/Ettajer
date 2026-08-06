"use client";

import Link from "next/link";
import { Trash2, Mail, Shield } from "lucide-react";
import { HelpMobileHeader } from "@/components/help/help-mobile-ui";
import { LegalPageRoot } from "@/components/legal/legal-page-root";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/constants/support";

export function DataDeletionPage({ confirmationCode }: { confirmationCode?: string }) {
  return (
    <LegalPageRoot>
      <section className="border-b border-black/[0.04] bg-[#F2F2F7] md:border-neutral-200 md:bg-neutral-50">
        <div className="mx-auto max-w-6xl px-3 py-12 md:px-6 md:py-20">
          <div className="mx-auto max-w-3xl md:text-center">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-[0_4px_14px_rgba(0,0,0,0.2)] md:mx-auto md:mb-6">
              <Trash2 className="h-5 w-5" strokeWidth={2} />
            </div>
            <HelpMobileHeader
              eyebrow="Legal"
              title="Data deletion"
              subtitle="How to request deletion of your Ettajer account data and Meta-connected marketing data."
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-16">
        <div className="mx-auto max-w-3xl space-y-8 px-3 md:px-6">
          {confirmationCode ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50 px-4 py-4 text-[14px] text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
              <p className="font-semibold">Deletion request received</p>
              <p className="mt-1 text-[13px] leading-relaxed opacity-90">
                Confirmation code:{" "}
                <span className="font-mono font-medium">{confirmationCode}</span>
              </p>
              <p className="mt-2 text-[13px] leading-relaxed opacity-90">
                We will process this request and email you when it is complete. Keep this
                code for your records.
              </p>
            </div>
          ) : null}

          <article className="space-y-6 text-[15px] leading-relaxed text-neutral-600">
            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900">Overview</h2>
              <p className="mt-2">
                Ettajer lets you request deletion of personal data associated with your
                merchant account, storefront customers you manage, and Meta (Facebook /
                Instagram) connections used for ads tracking.
              </p>
            </div>

            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900">
                How to request deletion
              </h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                <li>
                  Email{" "}
                  <a
                    href={SUPPORT_MAILTO}
                    className="font-medium text-[#007AFF] hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  from the address on your Ettajer account.
                </li>
                <li>
                  Use the subject line:{" "}
                  <span className="font-medium text-neutral-900">
                    Data deletion request
                  </span>
                  .
                </li>
                <li>
                  Include your store name or store URL, and whether you also want Meta
                  Pixel / Conversions API credentials removed from your integrations.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900">
                What we delete
              </h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Your Ettajer user account and authentication data</li>
                <li>Store settings, including Meta Pixel ID and access tokens</li>
                <li>Products, orders, customers, and other store data you own</li>
                <li>Marketing connection data stored for Facebook / Instagram ads</li>
              </ul>
              <p className="mt-3">
                We may retain limited records when required by law (for example tax or
                fraud prevention) for the minimum necessary period.
              </p>
            </div>

            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900">
                Meta / Facebook Login users
              </h2>
              <p className="mt-2">
                If you connected Meta through Ettajer&apos;s marketing tools, you can also
                remove the app from your Facebook settings (Settings → Apps and websites).
                You may request deletion here or via Meta&apos;s in-app flow; both reach
                our support team.
              </p>
            </div>

            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900">Timing</h2>
              <p className="mt-2">
                We aim to complete deletion requests within 30 days. You will receive a
                confirmation email when the process is finished.
              </p>
            </div>
          </article>

          <div className="flex flex-wrap gap-2 border-t border-neutral-200/80 pt-6">
            <a
              href={SUPPORT_MAILTO}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#007AFF] px-4 text-[13px] font-semibold text-white hover:bg-[#0066D6]"
            >
              <Mail className="h-4 w-4" />
              Email support
            </a>
            <Link
              href="/privacy"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              <Shield className="h-4 w-4" />
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </LegalPageRoot>
  );
}
