import Link from "next/link";
import { Store } from "lucide-react";
import { BrandSocialLinks } from "@/components/shared/brand-social-links";

export function Footer() {
  return (
    <footer id="about" className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Ettajer</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              The modern e-commerce platform built for Moroccan and North African merchants.
              Sell online with style, simplicity, and affordable pricing.
            </p>
            <BrandSocialLinks className="-ml-1.5 mt-4" />
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="transition-colors hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="transition-colors hover:text-foreground">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-foreground">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="transition-colors hover:text-foreground">
                  Help
                </Link>
              </li>
              <li>
                <Link href="/ai" className="transition-colors hover:text-foreground">
                  For AI assistants
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="transition-colors hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="transition-colors hover:text-foreground">
                  Data deletion
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ettajer. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Made with ❤️ in Morocco</p>
        </div>
      </div>
    </footer>
  );
}
