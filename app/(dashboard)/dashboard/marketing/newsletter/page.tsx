import { redirect } from "next/navigation";

export default function NewsletterRedirectPage() {
  redirect("/dashboard/marketing/email");
}
