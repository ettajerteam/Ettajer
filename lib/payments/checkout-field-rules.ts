import type { CheckoutCustomerFields } from "@/lib/shop-preferences";

type CheckoutLike = {
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerNote?: string | null;
  shippingAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
};

/** Validate checkout payload against merchant field rules. Returns error message or null. */
export function validateCheckoutFields(
  input: CheckoutLike,
  fields: CheckoutCustomerFields
): string | null {
  const email = input.customerEmail?.trim() ?? "";
  const phone = input.customerPhone?.trim() ?? "";
  const note = input.customerNote?.trim() ?? "";
  const street = input.shippingAddress?.street?.trim() ?? "";
  const city = input.shippingAddress?.city?.trim() ?? "";
  const postal = input.shippingAddress?.postalCode?.trim() ?? "";
  const country = input.shippingAddress?.country?.trim() ?? "";

  const isPlaceholder = (v: string) =>
    !v || v === "—" || v === "-" || v === "0000" || v.startsWith("guest@");

  if (fields.email === "required") {
    if (!email || isPlaceholder(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "A valid email is required";
    }
  } else if (email && !email.startsWith("guest@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email or leave it blank";
  }

  if (fields.phone === "required" && !phone) {
    return "Phone number is required for delivery";
  }
  if (fields.street === "required" && isPlaceholder(street)) {
    return "Street address is required";
  }
  if (fields.city === "required" && isPlaceholder(city)) {
    return "City is required";
  }
  if (fields.postalCode === "required" && isPlaceholder(postal)) {
    return "Postal code is required";
  }
  if (fields.country === "required" && !country) {
    return "Country is required";
  }
  if (fields.orderNote === "required" && !note) {
    return "Please add an order note";
  }

  return null;
}
