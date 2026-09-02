import { z } from "zod";

// Shared validation used by both the client-side form (react-hook-form)
// and the server action, so rules stay in one place.

export const studentFormSchema = z.object({
  fullName: z.string().min(2, "Bacchay ka naam kam az kam 2 harf ka ho"),
  rollNumber: z.string().min(1, "Roll number likhna zaroori hai"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional(),
  dateOfBirth: z.string().optional(), // yyyy-mm-dd from <input type="date">
  bFormOrCnic: z.string().optional(),
  address: z.string().optional(),
  admissionDate: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  parentId: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
