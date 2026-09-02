import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectionForm } from "../../section-form";
import { updateSection } from "../../../../actions";

export default async function EditSectionPage({
  params,
}: {
  params: { classId: string; sectionId: string };
}) {
  const [klass, section, staff] = await Promise.all([
    prisma.class.findUnique({ where: { id: params.classId } }),
    prisma.section.findUnique({ where: { id: params.sectionId } }),
    prisma.staff.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  if (!klass || !section || section.classId !== klass.id) {
    notFound();
  }

  const teacherOptions = staff.map((s: { id: string; user: { name: string } }) => ({
    id: s.id,
    name: s.user.name,
  }));

  const boundUpdateSection = updateSection.bind(null, klass.id, section.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Edit Section</h1>
        <p className="text-sm text-slate-500">
          &ldquo;{klass.name} - {section.name}&rdquo; ki details update karein.
        </p>
      </div>

      <SectionForm
        action={boundUpdateSection}
        className={klass.name}
        teacherOptions={teacherOptions}
        submitLabel="Update Section"
        cancelHref="/dashboard/admin/classes"
        defaultValues={{
          name: section.name,
          classTeacherId: section.classTeacherId ?? "",
          capacity: section.capacity ? String(section.capacity) : "",
        }}
      />
    </div>
  );
}
