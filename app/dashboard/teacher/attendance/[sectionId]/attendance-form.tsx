"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Clock, Umbrella } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveAttendance } from "./actions";

// ==========================================================
// One row per student with 4 status buttons. Everything is
// kept in local state and submitted together in one server
// action call when "Save Attendance" is pressed — this avoids
// firing a network request per checkbox click.
// ==========================================================

export type AttendanceStatusValue = "PRESENT" | "ABSENT" | "LEAVE" | "LATE";

export interface StudentRow {
  id: string;
  fullName: string;
  rollNumber: string;
  status: AttendanceStatusValue;
}

const statusOptions: {
  value: AttendanceStatusValue;
  label: string;
  icon: typeof Check;
  activeClass: string;
}[] = [
  {
    value: "PRESENT",
    label: "Present",
    icon: Check,
    activeClass: "bg-emerald-600 text-white border-emerald-600",
  },
  {
    value: "ABSENT",
    label: "Absent",
    icon: X,
    activeClass: "bg-red-600 text-white border-red-600",
  },
  {
    value: "LATE",
    label: "Late",
    icon: Clock,
    activeClass: "bg-amber-500 text-white border-amber-500",
  },
  {
    value: "LEAVE",
    label: "Leave",
    icon: Umbrella,
    activeClass: "bg-slate-500 text-white border-slate-500",
  },
];

export function AttendanceForm({
  sectionId,
  date,
  initialStudents,
}: {
  sectionId: string;
  date: string;
  initialStudents: StudentRow[];
}) {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setStatus(studentId: string, status: AttendanceStatusValue) {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  }

  function markAllPresent() {
    setStudents((prev) => prev.map((s) => ({ ...s, status: "PRESENT" })));
  }

  function handleSave() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await saveAttendance({
        sectionId,
        date,
        records: students.map((s) => ({ studentId: s.id, status: s.status })),
      });

      if (!result.success) {
        setError(result.error ?? "Attendance save nahi ho saki.");
        return;
      }

      setMessage("Attendance save ho gayi.");
      router.refresh();
    });
  }

  const presentCount = students.filter((s) => s.status === "PRESENT").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{presentCount}</span>
          {" / "}
          {students.length} present
        </p>
        <Button type="button" variant="outline" size="sm" onClick={markAllPresent}>
          Sab ko Present mark karein
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Roll No.</th>
              <th className="px-4 py-3">Naam</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-400">
                  Is section mein koi student nahi hai.
                </td>
              </tr>
            )}
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-3 text-slate-500">{student.rollNumber}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {student.fullName}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    {statusOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = student.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          title={opt.label}
                          onClick={() => setStatus(student.id, opt.value)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md border text-slate-500 transition-colors",
                            isActive
                              ? opt.activeClass
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <div>
        <Button type="button" onClick={handleSave} disabled={isPending || students.length === 0}>
          {isPending ? "Save ho raha hai..." : "Save Attendance"}
        </Button>
      </div>
    </div>
  );
}
