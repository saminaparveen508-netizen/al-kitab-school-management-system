"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { classFormSchema } from "@/lib/validations/class";
import { sectionFormSchema } from "@/lib/validations/section";

// ==========================================================
// Server Actions for Classes & Sections.
//
// Deletion safety:
// - A Class's sections are deleted automatically by the DB
//   (Section.class has onDelete: Cascade), but any students
//   sitting in those sections must be un-assigned first, or
//   the cascade would hit a blocked foreign key on Student.
// - A Section on its own: same idea — students are unassigned
//   (set sectionId = null) before the section itself is removed.
//   Students are NEVER deleted by these actions.
// ==========================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ---------------- CLASS ----------------

export async function createClass(formData: FormData): Promise<ActionResult> {
  const parsed = classFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form mein ghalti hai",
    };
  }

  try {
    const existing = await prisma.class.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing) {
      return { success: false, error: "Is naam ki class pehle se maujood hai" };
    }

    const lastClass = await prisma.class.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastClass?.order ?? -1) + 1;

    await prisma.class.create({
      data: { name: parsed.data.name, order: nextOrder },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Class save nahi ho saki." };
  }

  revalidatePath("/dashboard/admin/classes");
  redirect("/dashboard/admin/classes");
}

export async function updateClass(
  classId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = classFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form mein ghalti hai",
    };
  }

  try {
    const existing = await prisma.class.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing && existing.id !== classId) {
      return { success: false, error: "Is naam ki class pehle se maujood hai" };
    }

    await prisma.class.update({
      where: { id: classId },
      data: { name: parsed.data.name },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Update nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/classes");
  redirect("/dashboard/admin/classes");
}

export async function deleteClass(classId: string): Promise<ActionResult> {
  try {
    const sections = await prisma.section.findMany({
      where: { classId },
      select: { id: true },
    });
    const sectionIds = sections.map((s: { id: string }) => s.id);

    if (sectionIds.length > 0) {
      await prisma.student.updateMany({
        where: { sectionId: { in: sectionIds } },
        data: { sectionId: null },
      });
    }

    // Deleting the class cascades to delete its sections and
    // subjects automatically (see onDelete: Cascade in schema.prisma).
    await prisma.class.delete({ where: { id: classId } });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Class delete nahi ho saki." };
  }

  revalidatePath("/dashboard/admin/classes");
  return { success: true };
}

// ---------------- SECTION ----------------

function parsedSectionFields(formData: FormData) {
  return sectionFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    classTeacherId: String(formData.get("classTeacherId") ?? ""),
    capacity: String(formData.get("capacity") ?? ""),
  });
}

export async function createSection(
  classId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parsedSectionFields(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form mein ghalti hai",
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.section.findUnique({
      where: { classId_name: { classId, name: data.name } },
    });
    if (existing) {
      return {
        success: false,
        error: "Is class mein yeh section naam pehle se maujood hai",
      };
    }

    await prisma.section.create({
      data: {
        classId,
        name: data.name,
        classTeacherId: data.classTeacherId || undefined,
        capacity: data.capacity ? Number(data.capacity) : undefined,
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Section save nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/classes");
  redirect("/dashboard/admin/classes");
}

export async function updateSection(
  classId: string,
  sectionId: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parsedSectionFields(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form mein ghalti hai",
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.section.findUnique({
      where: { classId_name: { classId, name: data.name } },
    });
    if (existing && existing.id !== sectionId) {
      return {
        success: false,
        error: "Is class mein yeh section naam pehle se maujood hai",
      };
    }

    await prisma.section.update({
      where: { id: sectionId },
      data: {
        name: data.name,
        classTeacherId: data.classTeacherId || null,
        capacity: data.capacity ? Number(data.capacity) : null,
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Update nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/classes");
  redirect("/dashboard/admin/classes");
}

export async function deleteSection(sectionId: string): Promise<ActionResult> {
  try {
    await prisma.student.updateMany({
      where: { sectionId },
      data: { sectionId: null },
    });

    await prisma.section.delete({ where: { id: sectionId } });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Section delete nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/classes");
  return { success: true };
}
