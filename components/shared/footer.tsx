import Link from "next/link";
import { Store } from "lucide-react";

export function Footer() {
  return (
    <footer id="about" className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Ettajer</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              The modern e-commerce platform built for Moroccan and North African merchants.
              Sell online with style, simplicity, and affordable pricing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground transition-colors">Help</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ettajer. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ in Morocco
          </p>
        </div>
      </div>
    </footer>
  );
}
