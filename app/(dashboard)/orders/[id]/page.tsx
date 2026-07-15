import { redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default function OrderDetailRedirect({ params }: PageProps) {
  redirect(`/dashboard/orders/${params.id}`);
}
