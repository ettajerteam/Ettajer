"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { USER_ROLE } from "@/lib/admin/constants";
import { AcademyComingSoonModal } from "@/components/academy/academy-coming-soon-modal";

/** Opens Academy coming-soon when redirected from /dashboard/academy as a merchant. */
export function AcademyComingSoonQueryOpener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === USER_ROLE.ADMIN;

  useEffect(() => {
    if (isAdmin) return;
    if (searchParams.get("academy") !== "coming-soon") return;
    setOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("academy");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [searchParams, isAdmin, router, pathname]);

  return (
    <AcademyComingSoonModal open={open} onClose={() => setOpen(false)} />
  );
}
