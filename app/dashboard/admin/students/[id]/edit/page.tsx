import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentForm } from "../../student-form";
import { updateStudent } from "../../actions";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export default async function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const [student, classes, parents] = await Promise.all([
    prisma.student.findUnique({
      where: { id: params.id },
      include: { section: true },
    }),
    prisma.class.findMany({
      include: { sections: { select: { id: true, name: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.parent.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!student) {
    notFound();
  }

  const parentOptions = parents.map(
    (p: { id: string; user: { name: string } }) => ({
      id: p.id,
      name: p.user.name,
    })
  );
  const boundUpdateStudent = updateStudent.bind(null, student.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Edit Student</h1>
        <p className="text-sm text-slate-500">
          {student.fullName} (Roll No. {student.rollNumber}) ki details update karein.
        </p>
      </div>

      <StudentForm
        action={boundUpdateStudent}
        classes={classes}
        parents={parentOptions}
        submitLabel="Update Student"
        defaultValues={{
          fullName: student.fullName,
          rollNumber: student.rollNumber,
          gender: student.gender ?? "",
          dateOfBirth: toDateInputValue(student.dateOfBirth),
          bFormOrCnic: student.bFormOrCnic ?? "",
          address: student.address ?? "",
          admissionDate: toDateInputValue(student.admissionDate),
          classId: student.section?.classId ?? "",
          sectionId: student.sectionId ?? "",
          parentId: student.parentId ?? "",
        }}
      />
    </div>
  );
}
