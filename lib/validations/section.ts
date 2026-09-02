import { z } from "zod";

export const sectionFormSchema = z.object({
  name: z.string().min(1, "Section ka naam likhna zaroori hai (e.g. A, B)"),
  classTeacherId: z.string().optional(),
  capacity: z
    .string()
    .refine((val) => val === "" || Number(val) > 0, {
      message: "Capacity ek musbat number honi chahiye",
    })
    .optional(),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;
