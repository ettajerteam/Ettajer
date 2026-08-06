import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingData } from "@/types";
import {
  isBusinessModel,
  type BusinessModel,
} from "@/lib/onboarding/business-models";

interface OnboardingStore {
  step: number;
  data: Partial<OnboardingData>;
  setStep: (step: number) => void;
  setData: (data: Partial<OnboardingData>) => void;
  reset: () => void;
}

function migrateOnboardingData(
  data: Partial<OnboardingData> | undefined
): Partial<OnboardingData> {
  if (!data) return {};
  const next = { ...data };

  if ((!next.businessModels || next.businessModels.length === 0) && next.businessModel) {
    if (isBusinessModel(next.businessModel)) {
      next.businessModels = [next.businessModel];
    }
  }

  if (Array.isArray(next.businessModels)) {
    next.businessModels = next.businessModels.filter(isBusinessModel) as BusinessModel[];
  }

  return next;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      data: {},
      setStep: (step) => set({ step }),
      setData: (data) =>
        set((state) => ({
          data: migrateOnboardingData({ ...state.data, ...data }),
        })),
      reset: () => set({ step: 1, data: {} }),
    }),
    {
      name: "ettajer-onboarding",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<OnboardingStore>;
        return {
          ...current,
          ...p,
          data: migrateOnboardingData(p.data ?? current.data),
          step: typeof p.step === "number" ? p.step : current.step,
        };
      },
    }
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
