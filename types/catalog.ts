export type CategoryStatus = "active" | "inactive";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: CategoryStatus;
  storeId: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  inventory: number;
  image: string | null;
}

export interface CategoryDetail extends Category {
  products: CategoryProduct[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
  storeId: string;
  productCount: number;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export interface PublicCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
}
