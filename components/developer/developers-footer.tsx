import Link from "next/link";
import Image from "next/image";
import { OpenConsoleLink } from "@/components/developer/open-console-link";

const BRAND_ICON = "/brand/App-Logo.png";

const DOC_LINKS = [
  { href: "/developers/quickstart", label: "Quickstart" },
  { href: "/developers/guides", label: "Guides" },
  { href: "/developers/authentication", label: "Authentication" },
  { href: "/developers/oauth", label: "OAuth" },
  { href: "/developers/api", label: "API" },
  { href: "/developers/mcp", label: "MCP" },
  { href: "/developers/themes", label: "Themes" },
] as const;

const RESOURCE_LINKS = [
  { href: "/developers/examples", label: "Examples" },
  { href: "/developers/ai-integration", label: "AI integration" },
  { href: "/developers/ai-system-prompt", label: "AI system prompt" },
  { href: "/developers/openapi.json", label: "OpenAPI" },
  { href: "/developers/llms.txt", label: "llms.txt" },
] as const;

export function DevelopersFooter() {
  return (
    <footer className="border-t border-black/[0.06] bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/developers" className="inline-flex items-center gap-2">
              <Image
                src={BRAND_ICON}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-[6px]"
              />
              <span className="text-[13px] font-semibold text-neutral-900">
                Ettajer
                <span className="font-normal text-neutral-400">
                  {" "}
                  for Developers
                </span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-neutral-500">
              AI designs the storefront. Ettajer runs commerce — products, cart,
              checkout, and orders.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-neutral-900">Docs</p>
            <ul className="mt-3 space-y-2">
              {DOC_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] text-neutral-500 transition hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-neutral-900">
              Resources
            </p>
            <ul className="mt-3 space-y-2">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] text-neutral-500 transition hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <OpenConsoleLink className="text-[12px] text-neutral-500 transition hover:text-neutral-900">
                  Console
                </OpenConsoleLink>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-neutral-900">Product</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-[12px] text-neutral-500 transition hover:text-neutral-900"
                >
                  Ettajer home
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-[12px] text-neutral-500 transition hover:text-neutral-900"
                >
                  Store dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-[12px] text-neutral-500 transition hover:text-neutral-900"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-black/[0.05] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-neutral-400">
            © {new Date().getFullYear()} Ettajer. All rights reserved.
          </p>
          <p className="text-[11px] text-neutral-400">
            MCP ·{" "}
            <code className="rounded bg-[#F5F5F7] px-1 py-0.5 text-[10px] text-neutral-600">
              https://www.ettajer.com/api/v1/mcp
            </code>
          </p>
        </div>
      </div>
    </footer>
  );
}
