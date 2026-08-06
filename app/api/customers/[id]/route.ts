import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { decodeCustomerId } from "@/lib/customer-id";
import { getCustomerByEmail } from "@/lib/customers";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = decodeCustomerId(params.id);
    if (!email) {
      return NextResponse.json({ message: "Invalid customer" }, { status: 400 });
    }

    const customer = await getCustomerByEmail(store.id, email);
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer, currency: store.currency });
  } catch (error) {
    console.error("Customer detail error:", error);
    return NextResponse.json({ message: "Failed to fetch customer" }, { status: 500 });
  }
}
