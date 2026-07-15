import type { FooterSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface FooterSectionProps {
  store: PublicStore;
  settings: FooterSectionSettings;
}

export function FooterSection({ store, settings }: FooterSectionProps) {
  const isBold = store.theme === "bold";

  return (
    <footer className={cn("border-t py-12", isBold ? "border-white/10" : "border-gray-100")}>
      <div
        className={cn(
          "max-w-6xl mx-auto px-6 text-center text-sm",
          isBold ? "text-zinc-500" : "text-gray-400"
        )}
      >
        © {new Date().getFullYear()} {store.name}
        {settings.showPoweredBy !== false ? " · Powered by Ettajer" : null}
      </div>
    </footer>
  );
}
