import { Suspense } from "react";
import EmailPreferencesClient from "./preferences-client";

export const metadata = { title: "Email preferences" };

export default function EmailPreferencesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-[14px] text-neutral-500">
          Loading…
        </div>
      }
    >
      <EmailPreferencesClient />
    </Suspense>
  );
}
