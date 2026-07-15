export type DashboardSearchResultType = "order" | "product" | "page";

export interface DashboardSearchResult {
  id: string;
  type: DashboardSearchResultType;
  title: string;
  subtitle: string;
  href: string;
}
