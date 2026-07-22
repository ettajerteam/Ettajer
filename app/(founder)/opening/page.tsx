import { Suspense } from "react";
import OpeningClient from "./opening-client";

export default function OpeningPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-600">
          Opening your founder dashboard…
        </div>
      }
    >
      <OpeningClient />
    </Suspense>
  );
}
