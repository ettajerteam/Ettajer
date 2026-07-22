import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  listContactSubmissions,
  serializeContactSubmission,
} from "@/lib/contact-submissions";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const submissions = await listContactSubmissions(store.id);
    return NextResponse.json({
      submissions: submissions.map(serializeContactSubmission),
      count: submissions.length,
    });
  } catch (error) {
    console.error("Contact list error:", error);
    return NextResponse.json({ message: "Failed to load messages" }, { status: 500 });
  }
}
