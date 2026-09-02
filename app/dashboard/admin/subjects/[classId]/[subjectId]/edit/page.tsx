import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubjectForm } from "../../../subject-form";
import { updateSubject } from "../../../actions";

export default async function EditSubjectPage({
  params,
}: {
  params: { classId: string; subjectId: string };
}) {
  const [klass, subject, staff] = await Promise.all([
    prisma.class.findUnique({ where: { id: params.classId } }),
    prisma.subject.findUnique({
      where: { id: params.subjectId },
      include: { teachers: { select: { staffId: true } } },
    }),
    prisma.staff.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  if (!klass || !subject || subject.classId !== klass.id) {
    notFound();
  }

  const teacherOptions = staff.map(
    (s: { id: string; designation: string | null; user: { name: string } }) => ({
      id: s.id,
      name: s.user.name,
      designation: s.designation,
    })
  );

  const boundUpdateSubject = updateSubject.bind(null, klass.id, subject.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Edit Subject</h1>
        <p className="text-sm text-slate-500">
          &ldquo;{klass.name} - {subject.name}&rdquo; ki details update karein.
        </p>
      </div>

      <SubjectForm
        action={boundUpdateSubject}
        className={klass.name}
        teacherOptions={teacherOptions}
        submitLabel="Update Subject"
        defaultValues={{
          name: subject.name,
          code: subject.code,
          teacherIds: subject.teachers.map((t: { staffId: string }) => t.staffId),
        }}
      />
    </div>
  );
}
