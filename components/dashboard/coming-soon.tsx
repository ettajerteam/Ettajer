import { Construction } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center max-w-lg mx-auto">
      <div className="h-16 w-16 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center mb-6">
        <Construction className="h-8 w-8 text-[#007AFF]" />
      </div>
      <h2 className="text-xl font-semibold mb-2 capitalize">{title}</h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm">
        We&apos;re building this section to match the full Shopify-style merchant experience. Check back soon.
      </p>
      <Button asChild variant="outline" className="rounded-xl">
        <Link href="/dashboard">Back to Home</Link>
      </Button>
    </div>
  );
}
