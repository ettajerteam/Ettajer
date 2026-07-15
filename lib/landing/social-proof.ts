export type LiveActivityEvent = {
  id: string;
  message: string;
  city: string;
  timeAgo: string;
};

export const LIVE_ACTIVITY_EVENTS: LiveActivityEvent[] = [
  {
    id: "1",
    message: "enabled COD verification",
    city: "Casablanca",
    timeAgo: "2m ago",
  },
  {
    id: "2",
    message: "launched a new storefront",
    city: "Rabat",
    timeAgo: "5m ago",
  },
  {
    id: "3",
    message: "confirmed 12 COD orders",
    city: "Marrakech",
    timeAgo: "8m ago",
  },
  {
    id: "4",
    message: "connected Meta Pixel",
    city: "Tanger",
    timeAgo: "11m ago",
  },
  {
    id: "5",
    message: "reduced fake orders by 43%",
    city: "Fès",
    timeAgo: "14m ago",
  },
  {
    id: "6",
    message: "published their first product",
    city: "Agadir",
    timeAgo: "18m ago",
  },
];
