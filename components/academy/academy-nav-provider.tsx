"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AcademySchoolEnterOverlay,
  type SchoolEnterPayload,
} from "@/components/academy/academy-school-enter";
import { usePrefersReducedMotion } from "@/components/academy/use-prefers-reduced-motion";
import { subjectHref } from "@/lib/academy/subjects";

type Ctx = {
  enterSchool: (slug: string, payload: SchoolEnterPayload) => void;
};

const AcademyNavContext = createContext<Ctx | null>(null);

export function useAcademyNav() {
  const ctx = useContext(AcademyNavContext);
  if (!ctx) {
    throw new Error("useAcademyNav must be used within AcademyNavProvider");
  }
  return ctx;
}

export function AcademyNavProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [enter, setEnter] = useState<SchoolEnterPayload | null>(null);

  const enterSchool = useCallback(
    (slug: string, payload: SchoolEnterPayload) => {
      const href = subjectHref(slug);
      if (reduced) {
        router.push(href);
        return;
      }
      setEnter(payload);
      window.setTimeout(() => {
        router.push(href);
        window.setTimeout(() => setEnter(null), 350);
      }, 680);
    },
    [reduced, router],
  );

  const value = useMemo(() => ({ enterSchool }), [enterSchool]);

  return (
    <AcademyNavContext.Provider value={value}>
      <AcademySchoolEnterOverlay payload={enter} />
      {children}
    </AcademyNavContext.Provider>
  );
}
