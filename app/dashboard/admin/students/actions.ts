"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { studentFormSchema } from "@/lib/validations/student";
import { Gender } from "@prisma/client";

// ==========================================================
// Server Actions for the Students module (Admin only pages
// call these — protected already by middleware.ts + layout).
// Each action takes plain FormData, validates it with zod,
// then talks to Prisma directly (no separate API route needed).
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
    fullName: String(formData.get("fullName") ?? ""),
    rollNumber: String(formData.get("rollNumber") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    bFormOrCnic: String(formData.get("bFormOrCnic") ?? ""),
    address: String(formData.get("address") ?? ""),
    admissionDate: String(formData.get("admissionDate") ?? ""),
    classId: String(formData.get("classId") ?? ""),
    sectionId: String(formData.get("sectionId") ?? ""),
    parentId: String(formData.get("parentId") ?? ""),
  };

  return studentFormSchema.safeParse(raw);
}

export async function createStudent(
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
    const existing = await prisma.student.findUnique({
      where: { rollNumber: data.rollNumber },
    });

    if (existing) {
      return { success: false, error: "Yeh Roll Number pehle se maujood hai" };
    }

    await prisma.student.create({
      data: {
        fullName: data.fullName,
        rollNumber: data.rollNumber,
        gender: toGender(data.gender),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        bFormOrCnic: data.bFormOrCnic || undefined,
        address: data.address || undefined,
        admissionDate: data.admissionDate
          ? new Date(data.admissionDate)
          : undefined,
        sectionId: data.sectionId || undefined,
        parentId: data.parentId || undefined,
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Student save nahi ho saka. Dobara koshish karein." };
  }

  revalidatePath("/dashboard/admin/students");
  redirect("/dashboard/admin/students");
}

export async function updateStudent(
  studentId: string,
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
    const existing = await prisma.student.findUnique({
      where: { rollNumber: data.rollNumber },
    });

    if (existing && existing.id !== studentId) {
      return { success: false, error: "Yeh Roll Number kisi aur student ka hai" };
    }

    await prisma.student.update({
      where: { id: studentId },
      data: {
        fullName: data.fullName,
        rollNumber: data.rollNumber,
        gender: toGender(data.gender),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        bFormOrCnic: data.bFormOrCnic || null,
        address: data.address || null,
        admissionDate: data.admissionDate
          ? new Date(data.admissionDate)
          : undefined,
        sectionId: data.sectionId || null,
        parentId: data.parentId || null,
      },
    });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Update nahi ho saka. Dobara koshish karein." };
  }

  revalidatePath("/dashboard/admin/students");
  redirect("/dashboard/admin/students");
}

export async function deleteStudent(studentId: string): Promise<ActionResult> {
  try {
    await prisma.student.delete({ where: { id: studentId } });
  } catch (err) {
    console.error(err);
    return { success: false, error: "Delete nahi ho saka." };
  }

  revalidatePath("/dashboard/admin/students");
  return { success: true };
}
