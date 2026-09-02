import Link from "next/link";
import { Plus, Pencil, UserCog } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteSubjectButton } from "./delete-button";

// ==========================================================
// Admin > Subjects
// Grouped by class (same visual pattern as Classes & Sections)
// so admins can see, at a glance, what's taught in each grade
// and who teaches it.
// ==========================================================

interface SubjectRow {
  id: string;
  name: string;
  code: string;
  teachers: { staff: { user: { name: string } } }[];
}

interface ClassRow {
  id: string;
  name: string;
  subjects: SubjectRow[];
}

export default async function SubjectsPage() {
  const classes = await prisma.class.findMany({
    include: {
      subjects: {
        include: {
          teachers: {
            include: { staff: { include: { user: { select: { name: true } } } } },
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Subjects</h1>
        <p className="text-sm text-slate-500">
          Har class ke subjects aur unhein parhane wale teachers yahan manage
          karein.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {classes.map((klass: ClassRow) => (
          <Card key={klass.id}>
            <CardContent className="flex flex-col gap-4 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{klass.name}</p>
                  <p className="text-xs text-slate-500">
                    {klass.subjects.length} subject
                    {klass.subjects.length !== 1 && "s"}
                  </p>
                </div>
                <Link href={`/dashboard/admin/subjects/${klass.id}/new`}>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                    Add Subject
                  </Button>
                </Link>
              </div>

              {klass.subjects.length === 0 ? (
                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-400">
                  Is class mein abhi koi subject nahi hai.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {klass.subjects.map((subject: SubjectRow) => (
                    <div
                      key={subject.id}
                      className="flex items-start justify-between rounded-lg border border-slate-200 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {subject.name}
                        </p>
                        <p className="text-xs text-slate-400">{subject.code}</p>
                        <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                          <UserCog className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>
                            {subject.teachers.length === 0
                              ? "Koi teacher assign nahi"
                              : subject.teachers
                                  .map((t) => t.staff.user.name)
                                  .join(", ")}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/admin/subjects/${klass.id}/${subject.id}/edit`}
                        >
                          <Button type="button" variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteSubjectButton
                          subjectId={subject.id}
                          subjectLabel={`${klass.name} - ${subject.name}`}
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
