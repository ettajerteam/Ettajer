"use client";

import { createContext, useContext } from "react";
import { getHomeCopy, type HomeCopy } from "@/lib/dashboard/home-i18n";

const HomeI18nContext = createContext<HomeCopy>(getHomeCopy("en"));

export function HomeI18nProvider({
  copy,
  children,
}: {
  copy: HomeCopy;
  children: React.ReactNode;
}) {
  return <HomeI18nContext.Provider value={copy}>{children}</HomeI18nContext.Provider>;
}

export function useHomeCopy(): HomeCopy {
  return useContext(HomeI18nContext);
}
