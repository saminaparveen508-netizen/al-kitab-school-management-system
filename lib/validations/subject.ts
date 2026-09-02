import { z } from "zod";

export const subjectFormSchema = z.object({
  name: z.string().min(1, "Subject ka naam likhna zaroori hai"),
  code: z.string().min(1, "Subject code likhna zaroori hai"),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
