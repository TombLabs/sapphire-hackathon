import { z } from "zod";

export const usernameSchema = z.object({
  name: z
    .string()
    .min(2, "Username must contain at least 2 characters")
    .max(24, "Username must contain at most 24 characters")
    .regex(/^[a-zA-Z0-9 ]*$/, "Username must contain only alphabet and numbers"),
});

export const bioSchema = z.object({
  bio: z.string().max(160, "Bio must contain at most 160 characters"),
});

export const handleSchema = z.object({
  handle: z
    .string()
    .min(1, "Handle must contain at least 1 characters")
    .max(16, "Handle must contain at most 16 characters")
    .regex(/^[a-zA-Z0-9]*$/, "Handle must contain only alphabet and numbers"),
});
