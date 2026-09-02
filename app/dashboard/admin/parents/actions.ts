"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parentFormSchema } from "@/lib/validations/parent";
import { Role } from "@prisma/client";

// ==========================================================
// Server Actions for the Parent module.
// A Parent record always has exactly one linked User (login
// account with role PARENT). create/update/delete here touch
// both tables together, same pattern as the Staff module.
// ==========================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parsedFields(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    fatherName: String(formData.get("fatherName") ?? ""),
    motherName: String(formData.get("motherName") ?? ""),
    cnic: String(formData.get("cnic") ?? ""),
    occupation: String(formData.get("occupation") ?? ""),
    address: String(formData.get("address") ?? ""),
  };

  return parentFormSchema.safeParse(raw);
}

export async function createParent(formData: FormData): Promise<ActionResult> {
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
    const [existingEmail, existingCnic] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      data.cnic
        ? prisma.parent.findUnique({ where: { cnic: data.cnic } })
        : Promise.resolve(null),
    ]);

    if (existingEmail) {
      return { success: false, error: "Yeh email pehle se registered hai" };
    }
    if (existingCnic) {
      return { success: false, error: "Yeh CNIC pehle se kisi aur parent ka hai" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: Role.PARENT,
        parentProfile: {
          create: {
            fatherName: data.fatherName || undefined,
            motherName: data.motherName || undefined,
            cnic: data.cnic || undefined,
            occupation: data.occupation || undefined,
            address: data.address || undefined,
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Parent save nahi ho saka. Dobara koshish karein." };
  }

  revalidatePath("/dashboard/admin/parents");
  redirect("/dashboard/admin/parents");
}

export async function updateParent(
  parentId: string,
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
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) {
      return { success: false, error: "Parent record nahi mila" };
    }

    const [existingEmail, existingCnic] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      data.cnic
        ? prisma.parent.findUnique({ where: { cnic: data.cnic } })
        : Promise.resolve(null),
    ]);

    if (existingEmail && existingEmail.id !== parent.userId) {
      return { success: false, error: "Yeh email kisi aur account ka hai" };
    }
    if (existingCnic && existingCnic.id !== parentId) {
      return { success: false, error: "Yeh CNIC kisi aur parent ka hai" };
    }

    await prisma.user.update({
      where: { id: parent.userId },
      data: {
        name: data.name,
        email: data.email,
        password: data.password
          ? await bcrypt.hash(data.password, 10)
          : undefined,
      },
    });

    await prisma.parent.update({
      where: { id: parentId },
      data: {
        fatherName: data.fatherName || null,
        motherName: data.motherName || null,
        cnic: data.cnic || null,
        occupation: data.occupation || null,
        address: data.address || null,
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Update nahi ho saka. Dobara koshish karein." };
  }

  revalidatePath("/dashboard/admin/parents");
  redirect("/dashboard/admin/parents");
}

export async function deleteParent(parentId: string): Promise<ActionResult> {
  try {
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) {
      return { success: false, error: "Parent record nahi mila" };
    }

    // Un-link this parent from their children first, so the delete
    // below doesn't fail on the foreign key constraint. The students
    // themselves are NOT deleted — only the parent link is cleared.
    await prisma.student.updateMany({
      where: { parentId },
      data: { parentId: null },
    });

    // Deleting the User cascades to delete the Parent row too
    // (see onDelete: Cascade on Parent.user in schema.prisma).
    await prisma.user.delete({ where: { id: parent.userId } });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Delete nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/parents");
  return { success: true };
}
