import { z } from "zod";

// Shared validation for the Staff form. Password is required only
// when creating a new staff member — the server actions decide
// that part themselves (this schema keeps it optional so the same
// object shape works for both create and edit).

export const staffFormSchema = z.object({
  name: z.string().min(2, "Naam kam az kam 2 harf ka ho"),
  email: z.string().email("Sahi email address likhein"),
  password: z
    .string()
    .refine((val) => val === "" || val.length >= 6, {
      message: "Password kam az kam 6 harf ka ho",
    })
    .optional(),
  role: z.enum(["ADMIN", "TEACHER"], {
    error: "Role select karna zaroori hai",
  }),
  employeeCode: z.string().min(1, "Employee code likhna zaroori hai"),
  staffType: z.enum(["TEACHING", "NON_TEACHING"]),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional(),
  cnic: z.string().optional(),
  address: z.string().optional(),
  joiningDate: z.string().optional(),
  salary: z.string().optional(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;
