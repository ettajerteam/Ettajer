"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type FounderMobileTab = "home" | "card" | "contact" | "menu";

interface FounderAppContextValue {
  tab: FounderMobileTab;
  setTab: (tab: FounderMobileTab) => void;
  isMobileApp: boolean;
}

const FounderAppContext = createContext<FounderAppContextValue | null>(null);

export function FounderAppProvider({
  children,
  defaultTab = "home",
}: {
  children: React.ReactNode;
  defaultTab?: FounderMobileTab;
}) {
  const [tab, setTabState] = useState<FounderMobileTab>(defaultTab);

  const setTab = useCallback((next: FounderMobileTab) => {
    setTabState(next);
    if (next !== "menu") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <FounderAppContext.Provider
      value={{
        tab,
        setTab,
        isMobileApp: true,
      }}
    >
      {children}
    </FounderAppContext.Provider>
  );
}

export function useFounderApp() {
  const ctx = useContext(FounderAppContext);
  if (!ctx) {
    return {
      tab: "home" as FounderMobileTab,
      setTab: () => {},
      isMobileApp: false,
    };
  }
  return ctx;
}
