import { z } from "zod";

// Shared validation for the Parent form. Password is required only
// when creating a new parent — the same object shape is reused for
// both create and edit so this stays optional here.

export const parentFormSchema = z.object({
  name: z.string().min(2, "Naam kam az kam 2 harf ka ho"),
  email: z.string().email("Sahi email address likhein"),
  password: z
    .string()
    .refine((val) => val === "" || val.length >= 6, {
      message: "Password kam az kam 6 harf ka ho",
    })
    .optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  cnic: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
});

export type ParentFormValues = z.infer<typeof parentFormSchema>;
