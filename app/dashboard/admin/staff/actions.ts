"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { staffFormSchema } from "@/lib/validations/staff";
import { Gender, Role, StaffType } from "@prisma/client";

// ==========================================================
// Server Actions for the Staff module.
// A Staff record always has exactly one linked User (the
// login account), so create/update/delete here touch both
// tables together — createStaff makes the User first, then
// the Staff profile; deleteStaff removes the User, which
// cascades to delete the Staff row automatically (see
// prisma/schema.prisma — Staff.user has onDelete: Cascade).
// ==========================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

function toGender(value: string | undefined): Gender | undefined {
  if (value === "MALE" || value === "FEMALE" || value === "OTHER") {
    return value;
  }
  return undefined;
}

function parsedFields(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? ""),
    employeeCode: String(formData.get("employeeCode") ?? ""),
    staffType: String(formData.get("staffType") ?? ""),
    designation: String(formData.get("designation") ?? ""),
    qualification: String(formData.get("qualification") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    cnic: String(formData.get("cnic") ?? ""),
    address: String(formData.get("address") ?? ""),
    joiningDate: String(formData.get("joiningDate") ?? ""),
    salary: String(formData.get("salary") ?? ""),
  };

  return staffFormSchema.safeParse(raw);
}

export async function createStaff(formData: FormData): Promise<ActionResult> {
  const parsed = parsedFields(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form mein ghalti hai",
    };
  }

  const data = parsed.data;

  if (!data.password) {
    return { success: false, error: "Password likhna zaroori hai" };
  }

  try {
    const [existingEmail, existingCode, existingCnic] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.staff.findUnique({ where: { employeeCode: data.employeeCode } }),
      data.cnic
        ? prisma.staff.findUnique({ where: { cnic: data.cnic } })
        : Promise.resolve(null),
    ]);

    if (existingEmail) {
      return { success: false, error: "Yeh email pehle se registered hai" };
    }
    if (existingCode) {
      return { success: false, error: "Yeh Employee Code pehle se maujood hai" };
    }
    if (existingCnic) {
      return { success: false, error: "Yeh CNIC pehle se kisi aur staff ka hai" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
        staffProfile: {
          create: {
            employeeCode: data.employeeCode,
            staffType: data.staffType as StaffType,
            designation: data.designation || undefined,
            qualification: data.qualification || undefined,
            gender: toGender(data.gender),
            cnic: data.cnic || undefined,
            address: data.address || undefined,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
            salary: data.salary ? Number(data.salary) : undefined,
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Staff save nahi ho saka. Dobara koshish karein." };
  }

  revalidatePath("/dashboard/admin/staff");
  redirect("/dashboard/admin/staff");
}

export async function updateStaff(
  staffId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parsedFields(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form mein ghalti hai",
    };
  }

  const data = parsed.data;

  try {
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      return { success: false, error: "Staff record nahi mila" };
    }

    const [existingEmail, existingCode, existingCnic] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.staff.findUnique({ where: { employeeCode: data.employeeCode } }),
      data.cnic
        ? prisma.staff.findUnique({ where: { cnic: data.cnic } })
        : Promise.resolve(null),
    ]);

    if (existingEmail && existingEmail.id !== staff.userId) {
      return { success: false, error: "Yeh email kisi aur account ka hai" };
    }
    if (existingCode && existingCode.id !== staffId) {
      return { success: false, error: "Yeh Employee Code kisi aur staff ka hai" };
    }
    if (existingCnic && existingCnic.id !== staffId) {
      return { success: false, error: "Yeh CNIC kisi aur staff ka hai" };
    }

    await prisma.user.update({
      where: { id: staff.userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role as Role,
        password: data.password
          ? await bcrypt.hash(data.password, 10)
          : undefined,
      },
    });

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        employeeCode: data.employeeCode,
        staffType: data.staffType as StaffType,
        designation: data.designation || null,
        qualification: data.qualification || null,
        gender: toGender(data.gender) ?? null,
        cnic: data.cnic || null,
        address: data.address || null,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
        salary: data.salary ? Number(data.salary) : null,
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Update nahi ho saka. Dobara koshish karein." };
  }

  revalidatePath("/dashboard/admin/staff");
  redirect("/dashboard/admin/staff");
}

export async function deleteStaff(staffId: string): Promise<ActionResult> {
  try {
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      return { success: false, error: "Staff record nahi mila" };
    }

    // Un-assign this staff member from any section they're the
    // class-teacher of, so the delete below doesn't fail on the
    // foreign key constraint.
    await prisma.section.updateMany({
      where: { classTeacherId: staffId },
      data: { classTeacherId: null },
    });

    // Deleting the User cascades to delete the Staff row too
    // (see onDelete: Cascade on Staff.user in schema.prisma).
    await prisma.user.delete({ where: { id: staff.userId } });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Delete nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/staff");
  return { success: true };
}
