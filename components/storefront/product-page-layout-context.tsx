"use client";

import { createContext, useContext } from "react";

export type ProductPageZone = "default" | "gallery" | "details" | "below";

const ProductPageLayoutContext = createContext<ProductPageZone>("default");

export function ProductPageLayoutProvider({
  zone,
  children,
}: {
  zone: ProductPageZone;
  children: React.ReactNode;
}) {
  return (
    <ProductPageLayoutContext.Provider value={zone}>
      {children}
    </ProductPageLayoutContext.Provider>
  );
}

export function useProductPageZone(): ProductPageZone {
  return useContext(ProductPageLayoutContext);
}
