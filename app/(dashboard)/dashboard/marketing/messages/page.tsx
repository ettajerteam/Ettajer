import { redirect } from "next/navigation";

export default function MarketingMessagesRedirect({
  searchParams,
}: {
  searchParams?: { id?: string };
}) {
  const id = searchParams?.id;
  redirect(id ? `/dashboard/messages?id=${id}` : "/dashboard/messages");
}
