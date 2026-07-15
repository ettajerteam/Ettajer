import { create } from "zustand";
import type { StoreThemeSettings } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";

interface ThemeStoreState {
  draft: StoreThemeSettings;
  selectedTemplate: ThemeId;
  previewOpen: boolean;
  setDraft: (updates: Partial<StoreThemeSettings>) => void;
  setSelectedTemplate: (template: ThemeId) => void;
  setPreviewOpen: (open: boolean) => void;
  initFromStore: (settings: StoreThemeSettings & { theme: string }) => void;
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  draft: {},
  selectedTemplate: "minimal",
  previewOpen: false,

  setDraft: (updates) =>
    set((state) => ({
      draft: { ...state.draft, ...updates },
    })),

  setSelectedTemplate: (template) =>
    set((state) => ({
      selectedTemplate: template,
      draft: { ...state.draft, theme: template },
    })),

  setPreviewOpen: (open) => set({ previewOpen: open }),

  initFromStore: (settings) =>
    set({
      draft: {
        theme: settings.theme,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        font: settings.font,
        logo: settings.logo,
      },
      selectedTemplate: (settings.theme as ThemeId) || "minimal",
    }),
}));
