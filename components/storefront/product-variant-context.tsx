"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ProductVariant } from "@/types";

type Selection = Record<string, string>;

interface ProductVariantContextValue {
  selection: Selection;
  setOption: (variantName: string, value: string) => void;
  /** Cart-ready map of selected options, or null when nothing chosen. */
  selectedVariant: Selection | null;
}

const ProductVariantContext = createContext<ProductVariantContextValue | null>(null);

function initialSelection(variants: ProductVariant[]): Selection {
  const next: Selection = {};
  for (const variant of variants) {
    const first = variant.options[0];
    if (first) next[variant.name] = first;
  }
  return next;
}

export function ProductVariantProvider({
  variants,
  children,
}: {
  variants: ProductVariant[];
  children: React.ReactNode;
}) {
  const [selection, setSelection] = useState<Selection>(() => initialSelection(variants));

  const setOption = useCallback((variantName: string, value: string) => {
    setSelection((prev) => ({ ...prev, [variantName]: value }));
  }, []);

  const value = useMemo<ProductVariantContextValue>(() => {
    const selectedVariant = Object.keys(selection).length > 0 ? selection : null;
    return { selection, setOption, selectedVariant };
  }, [selection, setOption]);

  return (
    <ProductVariantContext.Provider value={value}>{children}</ProductVariantContext.Provider>
  );
}

export function useProductVariantSelection(): ProductVariantContextValue {
  const ctx = useContext(ProductVariantContext);
  if (!ctx) {
    return {
      selection: {},
      setOption: () => undefined,
      selectedVariant: null,
    };
  }
  return ctx;
}
