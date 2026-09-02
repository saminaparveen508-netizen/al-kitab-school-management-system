import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassForm } from "../../class-form";
import { updateClass } from "../../actions";

export default async function EditClassPage({
  params,
}: {
  params: { classId: string };
}) {
  const klass = await prisma.class.findUnique({
    where: { id: params.classId },
  });

  if (!klass) {
    notFound();
  }

  const boundUpdateClass = updateClass.bind(null, klass.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Edit Class</h1>
        <p className="text-sm text-slate-500">&ldquo;{klass.name}&rdquo; ki details update karein.</p>
      </div>

      <ClassForm
        action={boundUpdateClass}
        submitLabel="Update Class"
        defaultValues={{ name: klass.name }}
      />
    </div>
  );
}
