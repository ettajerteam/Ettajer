import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  listNewsletterSubscribers,
  serializeNewsletterSubscriber,
} from "@/lib/newsletter";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subscribers = await listNewsletterSubscribers(store.id);
    return NextResponse.json({
      subscribers: subscribers.map(serializeNewsletterSubscriber),
      count: subscribers.length,
    });
  } catch (error) {
    console.error("Newsletter list error:", error);
    return NextResponse.json({ message: "Failed to load subscribers" }, { status: 500 });
  }
}
