export interface ProductsSectionCounts {
  products: number;
  lowStock: number;
  outOfStock: number;
}

export interface ProductsListStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  catalogValue: number;
}

export const EMPTY_PRODUCTS_SECTION_COUNTS: ProductsSectionCounts = {
  products: 0,
  lowStock: 0,
  outOfStock: 0,
};

export const EMPTY_PRODUCTS_LIST_STATS: ProductsListStats = {
  total: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
  catalogValue: 0,
};
