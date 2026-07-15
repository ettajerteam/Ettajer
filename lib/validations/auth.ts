import { z } from "zod";

export const emailLocaleSchema = z.enum(["en", "fr", "ar"]).optional();

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  locale: emailLocaleSchema,
});

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address"),
    token: z.string().min(1, "Reset link is invalid"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
    locale: emailLocaleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
