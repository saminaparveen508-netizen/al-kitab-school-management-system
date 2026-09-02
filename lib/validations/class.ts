import { z } from "zod";

export const classFormSchema = z.object({
  name: z.string().min(1, "Class ka naam likhna zaroori hai"),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;
