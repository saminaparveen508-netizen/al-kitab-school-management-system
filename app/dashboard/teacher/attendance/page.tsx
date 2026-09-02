import Link from "next/link";
import { CalendarCheck, Users } from "lucide-react";
import { getCurrentTeacherStaff } from "@/lib/teacher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ==========================================================
// Teacher > Attendance
// Shows every section this teacher is the class-teacher of.
// Clicking a section takes them to the daily marking page.
// ==========================================================

interface SectionOverview {
  id: string;
  name: string;
  class: { name: string; order: number };
  students: { id: string; fullName: string }[];
}

export default async function TeacherAttendancePage() {
  const staff = await getCurrentTeacherStaff();
  const sections = staff?.sectionsInCharge ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500">
          Apni class select karein aur aaj ki attendance mark karein.
        </p>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Koi class assign nahi hui</CardTitle>
            <CardDescription>
              Aapko abhi tak kisi section ka class-teacher assign nahi kiya
              gaya. Attendance mark karne ke liye admin se rabta karein.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section: SectionOverview) => (
            <Link
              key={section.id}
              href={`/dashboard/teacher/attendance/${section.id}`}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between pt-5">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {section.class.name} - {section.name}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <Users className="h-3.5 w-3.5" />
                      {section.students.length} student
                      {section.students.length !== 1 && "s"}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
