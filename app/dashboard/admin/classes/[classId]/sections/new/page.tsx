import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectionForm } from "../section-form";
import { createSection } from "../../../actions";

export default async function NewSectionPage({
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

  const teacherOptions = staff.map((s: { id: string; user: { name: string } }) => ({
    id: s.id,
    name: s.user.name,
  }));

  const boundCreateSection = createSection.bind(null, klass.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Section</h1>
        <p className="text-sm text-slate-500">
          &ldquo;{klass.name}&rdquo; mein naya section shamil karein.
        </p>
      </div>

      <SectionForm
        action={boundCreateSection}
        className={klass.name}
        teacherOptions={teacherOptions}
        submitLabel="Add Section"
        cancelHref="/dashboard/admin/classes"
      />
    </div>
  );
}
