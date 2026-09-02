import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentTeacherStaff } from "@/lib/teacher";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AttendanceForm, type StudentRow } from "./attendance-form";

// ==========================================================
// Teacher > Attendance > [sectionId]
// ?date=yyyy-mm-dd controls which day is being marked/viewed.
// Defaults to today when no date is given.
// ==========================================================

interface SectionStudent {
  id: string;
  fullName: string;
  rollNumber: string;
}

interface AttendanceRecord {
  studentId: string;
  status: StudentRow["status"];
}

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function shiftDate(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default async function MarkAttendancePage({
  params,
  searchParams,
}: {
  params: { sectionId: string };
  searchParams: { date?: string };
}) {
  const staff = await getCurrentTeacherStaff();
  const section = staff?.sectionsInCharge.find(
    (s: { id: string }) => s.id === params.sectionId
  );

  if (!staff || !section) {
    notFound();
  }

  const date = searchParams.date || todayIsoDate();
  const attendanceDate = new Date(date);

  const existingRecords = await prisma.attendance.findMany({
    where: {
      date: attendanceDate,
      studentId: { in: section.students.map((s: SectionStudent) => s.id) },
    },
  });

  const statusByStudent = new Map(
    existingRecords.map((r: AttendanceRecord) => [r.studentId, r.status])
  );

  const studentRows: StudentRow[] = section.students.map((s: SectionStudent) => ({
    id: s.id,
    fullName: s.fullName,
    rollNumber: s.rollNumber,
    status: statusByStudent.get(s.id) ?? "PRESENT",
  }));

  const prettyDate = attendanceDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/teacher/attendance"
          className="text-sm text-emerald-700 hover:underline"
        >
          &larr; Sections
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          {section.class.name} - {section.name} — Attendance
        </h1>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
        <Link
          href={`/dashboard/teacher/attendance/${section.id}?date=${shiftDate(date, -1)}`}
        >
          <Button type="button" variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Pichla din
          </Button>
        </Link>

        <p className="text-sm font-medium text-slate-700">{prettyDate}</p>

        <Link
          href={`/dashboard/teacher/attendance/${section.id}?date=${shiftDate(date, 1)}`}
        >
          <Button type="button" variant="outline" size="sm">
            Agla din
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <AttendanceForm
        sectionId={section.id}
        date={date}
        initialStudents={studentRows}
      />
    </div>
  );
}
