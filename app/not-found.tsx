import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-6">
      <div className="max-w-md w-full rounded-2xl bg-white border shadow-sm p-8 text-center">
        <p className="text-6xl font-bold text-[#007AFF] mb-2">404</p>
        <h1 className="text-xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <Button asChild className="bg-[#007AFF] hover:bg-[#0071EB]">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
