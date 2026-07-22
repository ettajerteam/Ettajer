import { z } from "zod";

export const changeNamePreviewSchema = z.object({
  email: z.string().email(),
  token: z.string().min(20),
});

export const changeNameSubmitSchema = z.object({
  email: z.string().email(),
  token: z.string().min(20),
  newName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
});
