import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingData } from "@/types";

interface OnboardingStore {
  step: number;
  data: Partial<OnboardingData>;
  setStep: (step: number) => void;
  setData: (data: Partial<OnboardingData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      data: {},
      setStep: (step) => set({ step }),
      setData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
      reset: () => set({ step: 1, data: {} }),
    }),
    { name: "ettajer-onboarding" }
  )
);

interface SidebarStore {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  isCollapsed: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
