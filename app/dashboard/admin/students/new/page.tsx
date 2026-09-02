import { prisma } from "@/lib/prisma";
import { StudentForm } from "../student-form";
import { createStudent } from "../actions";

export default async function NewStudentPage() {
  const [classes, parents] = await Promise.all([
    prisma.class.findMany({
      include: { sections: { select: { id: true, name: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.parent.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const parentOptions = parents.map(
    (p: { id: string; user: { name: string } }) => ({
      id: p.id,
      name: p.user.name,
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Student</h1>
        <p className="text-sm text-slate-500">
          Naye student ki details bharein aur Save karein.
        </p>
      </div>

      <StudentForm
        action={createStudent}
        classes={classes}
        parents={parentOptions}
        submitLabel="Add Student"
      />
    </div>
  );
}
