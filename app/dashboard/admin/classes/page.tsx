import Link from "next/link";
import { Plus, Pencil, Users, UserCog } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteClassButton } from "./class-delete-button";
import { DeleteSectionButton } from "./section-delete-button";

// ==========================================================
// Admin > Classes & Sections
// Shows every class (Pre-Nursery ... Class 8, in order), each
// with its sections listed underneath — class teacher, student
// count, and edit/delete actions for both classes and sections.
// ==========================================================

interface SectionRow {
  id: string;
  name: string;
  capacity: number | null;
  classTeacher: { user: { name: string } } | null;
  students: { id: string }[];
}

interface ClassRow {
  id: string;
  name: string;
  order: number;
  sections: SectionRow[];
}

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      sections: {
        include: {
          classTeacher: { include: { user: { select: { name: true } } } },
          students: { select: { id: true } },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Classes &amp; Sections
          </h1>
          <p className="text-sm text-slate-500">
            Pre-Nursery se Class 8 tak — har class ke sections yahan manage karein.
          </p>
        </div>
        <Link href="/dashboard/admin/classes/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {classes.map((klass: ClassRow) => (
          <Card key={klass.id}>
            <CardContent className="flex flex-col gap-4 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{klass.name}</p>
                  <p className="text-xs text-slate-500">
                    {klass.sections.length} section
                    {klass.sections.length !== 1 && "s"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/dashboard/admin/classes/${klass.id}/sections/new`}>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                      Add Section
                    </Button>
                  </Link>
                  <Link href={`/dashboard/admin/classes/${klass.id}/edit`}>
                    <Button type="button" variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteClassButton
                    classId={klass.id}
                    className={klass.name}
                    sectionCount={klass.sections.length}
                  />
                </div>
              </div>

              {klass.sections.length === 0 ? (
                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-400">
                  Is class mein abhi koi section nahi hai.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {klass.sections.map((section: SectionRow) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Section {section.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <UserCog className="h-3 w-3" />
                          {section.classTeacher?.user.name ?? "Koi teacher nahi"}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Users className="h-3 w-3" />
                          {section.students.length}
                          {section.capacity ? ` / ${section.capacity}` : ""} students
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/admin/classes/${klass.id}/sections/${section.id}/edit`}
                        >
                          <Button type="button" variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteSectionButton
                          sectionId={section.id}
                          sectionLabel={`${klass.name} - ${section.name}`}
                          studentCount={section.students.length}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
