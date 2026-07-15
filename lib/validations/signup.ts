import { z } from "zod";
import { emailLocaleSchema } from "@/lib/validations/auth";

/** Practical email format check (used client + server). */
export const EMAIL_FORMAT_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")
  .regex(/[a-zA-Z]/, "Password must include at least one letter.")
  .regex(/\d/, "Password must include at least one number.");

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Enter your first name.")
      .max(40, "First name is too long."),
    surname: z
      .string()
      .trim()
      .min(1, "Enter your surname.")
      .max(40, "Surname is too long."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Enter your email address.")
      .email("Enter a valid email address.")
      .refine((value) => EMAIL_FORMAT_REGEX.test(value), {
        message: "Enter a valid email address (e.g. you@yourstore.ma).",
      }),
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirm your password."),
    acceptTerms: z.literal(true, {
      errorMap: () => ({
        message: "You must accept the Terms of Service and Privacy Policy.",
      }),
    }),
    marketingEmails: z.boolean().optional().default(false),
    locale: emailLocaleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export function formatSignupFullName(firstName: string, surname: string): string {
  return `${firstName.trim()} ${surname.trim()}`.trim();
}

export function isValidSignupEmail(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return EMAIL_FORMAT_REGEX.test(normalized);
}

export function isSignupPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password)
  );
}
