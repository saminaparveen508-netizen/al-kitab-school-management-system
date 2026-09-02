"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

// ==========================================================
// Server Action: saveAttendance
// Marks attendance for every student in a section, for one
// given date, in a single transaction (upsert per student so
// re-saving the same day just updates the existing record).
//
// Security: we re-check on the server that the logged-in
// teacher actually owns (is class-teacher of) the section
// being submitted — a student could otherwise call this
// action manually with someone else's sectionId.
// ==========================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

interface SaveAttendanceInput {
  sectionId: string;
  date: string; // yyyy-mm-dd
  records: { studentId: string; status: AttendanceStatus }[];
}

export async function saveAttendance(
  input: SaveAttendanceInput
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return { success: false, error: "Aap is action ke mujaz nahi hain." };
  }

  if (!input.date || Number.isNaN(new Date(input.date).getTime())) {
    return { success: false, error: "Date theek nahi hai." };
  }

  try {
    const staff = await prisma.staff.findUnique({
      where: { userId: session.user.id },
    });

    if (!staff) {
      return { success: false, error: "Teacher record nahi mila." };
    }

    const section = await prisma.section.findFirst({
      where: { id: input.sectionId, classTeacherId: staff.id },
      select: { id: true },
    });

    if (!section) {
      return {
        success: false,
        error: "Aap is section ke class-teacher nahi hain.",
      };
    }

    const attendanceDate = new Date(input.date);

    await prisma.$transaction(
      input.records.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: attendanceDate,
            },
          },
          update: { status: record.status },
          create: {
            studentId: record.studentId,
            date: attendanceDate,
            status: record.status,
          },
        })
      )
    );
  } catch (err) {
    console.error(err);
    return { success: false, error: "Attendance save nahi ho saki." };
  }

  revalidatePath(`/dashboard/teacher/attendance/${input.sectionId}`);
  return { success: true };
}
