import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubjectForm } from "../../subject-form";
import { createSubject } from "../../actions";

export default async function NewSubjectPage({
  params,
}: {
  params: { classId: string };
}) {
  const klass = await prisma.class.findUnique({ where: { id: params.classId } });

  if (!klass) {
    notFound();
  }

  const staff = await prisma.staff.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });

  const teacherOptions = staff.map(
    (s: { id: string; designation: string | null; user: { name: string } }) => ({
      id: s.id,
      name: s.user.name,
      designation: s.designation,
    })
  );

  const boundCreateSubject = createSubject.bind(null, klass.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Subject</h1>
        <p className="text-sm text-slate-500">
          &ldquo;{klass.name}&rdquo; mein naya subject shamil karein.
        </p>
      </div>

      <SubjectForm
        action={boundCreateSubject}
        className={klass.name}
        teacherOptions={teacherOptions}
        submitLabel="Add Subject"
      />
    </div>
  );
}
