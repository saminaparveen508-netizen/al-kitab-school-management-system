"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { subjectFormSchema } from "@/lib/validations/subject";

// ==========================================================
// Server Actions for Subjects.
// Each subject belongs to one class and can have multiple
// teachers assigned to it (many-to-many via TeacherSubject).
// The form submits a checkbox list of teacherIds — on save we
// "sync" the TeacherSubject rows: remove ones that were
// unchecked, add ones that are newly checked.
// ==========================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parsedSubjectFields(formData: FormData) {
  const parsed = subjectFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
  });
  const teacherIds = formData.getAll("teacherIds").map(String);
  return { parsed, teacherIds };
}

export async function createSubject(
  classId: string,
  formData: FormData
): Promise<ActionResult> {
  const { parsed, teacherIds } = parsedSubjectFields(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form mein ghalti hai",
    };
  }

  const data = parsed.data;

  try {
    const [existingCode, existingName] = await Promise.all([
      prisma.subject.findUnique({ where: { code: data.code } }),
      prisma.subject.findUnique({
        where: { classId_name: { classId, name: data.name } },
      }),
    ]);

    if (existingCode) {
      return { success: false, error: "Yeh Subject Code pehle se maujood hai" };
    }
    if (existingName) {
      return {
        success: false,
        error: "Is class mein yeh subject naam pehle se maujood hai",
      };
    }

    await prisma.subject.create({
      data: {
        classId,
        name: data.name,
        code: data.code,
        teachers: {
          create: teacherIds.map((staffId) => ({ staffId })),
        },
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Subject save nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/subjects");
  redirect("/dashboard/admin/subjects");
}

export async function updateSubject(
  classId: string,
  subjectId: string,
  formData: FormData
): Promise<ActionResult> {
  const { parsed, teacherIds } = parsedSubjectFields(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Form mein ghalti hai",
    };
  }

  const data = parsed.data;

  try {
    const [existingCode, existingName] = await Promise.all([
      prisma.subject.findUnique({ where: { code: data.code } }),
      prisma.subject.findUnique({
        where: { classId_name: { classId, name: data.name } },
      }),
    ]);

    if (existingCode && existingCode.id !== subjectId) {
      return { success: false, error: "Yeh Subject Code kisi aur subject ka hai" };
    }
    if (existingName && existingName.id !== subjectId) {
      return {
        success: false,
        error: "Is class mein yeh subject naam pehle se maujood hai",
      };
    }

    const currentLinks = await prisma.teacherSubject.findMany({
      where: { subjectId },
      select: { staffId: true },
    });
    const currentStaffIds = new Set<string>(
      currentLinks.map((l: { staffId: string }) => l.staffId)
    );
    const nextStaffIds = new Set<string>(teacherIds);

    const toRemove: string[] = Array.from(currentStaffIds).filter(
      (id: string) => !nextStaffIds.has(id)
    );
    const toAdd: string[] = Array.from(nextStaffIds).filter(
      (id: string) => !currentStaffIds.has(id)
    );

    await prisma.$transaction([
      prisma.subject.update({
        where: { id: subjectId },
        data: { name: data.name, code: data.code },
      }),
      ...(toRemove.length
        ? [
            prisma.teacherSubject.deleteMany({
              where: { subjectId, staffId: { in: toRemove } },
            }),
          ]
        : []),
      ...(toAdd.length
        ? [
            prisma.teacherSubject.createMany({
              data: toAdd.map((staffId) => ({ subjectId, staffId })),
            }),
          ]
        : []),
    ]);
  } catch (err) {
    console.error(err);
    return { success: false, error: "Update nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/subjects");
  redirect("/dashboard/admin/subjects");
}

export async function deleteSubject(subjectId: string): Promise<ActionResult> {
  try {
    // Deleting a Subject cascades to delete its TeacherSubject
    // links automatically (see onDelete: Cascade in schema.prisma).
    await prisma.subject.delete({ where: { id: subjectId } });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Subject delete nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/subjects");
  return { success: true };
}
