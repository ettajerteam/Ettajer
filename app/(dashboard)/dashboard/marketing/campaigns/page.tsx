import { redirect } from "next/navigation";

/** Campaigns removed — abandoned recovery lives under Orders. */
export default function MarketingCampaignsRedirect() {
  redirect("/dashboard/orders/abandoned");
}
