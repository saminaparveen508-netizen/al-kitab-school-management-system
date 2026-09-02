import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ParentForm } from "../../parent-form";
import { updateParent } from "../../actions";

export default async function EditParentPage({
  params,
}: {
  params: { id: string };
}) {
  const parent = await prisma.parent.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!parent) {
    notFound();
  }

  const boundUpdateParent = updateParent.bind(null, parent.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Edit Parent</h1>
        <p className="text-sm text-slate-500">
          {parent.user.name} ki details update karein.
        </p>
      </div>

      <ParentForm
        action={boundUpdateParent}
        isEdit
        submitLabel="Update Parent"
        defaultValues={{
          name: parent.user.name,
          email: parent.user.email,
          fatherName: parent.fatherName ?? "",
          motherName: parent.motherName ?? "",
          cnic: parent.cnic ?? "",
          occupation: parent.occupation ?? "",
          address: parent.address ?? "",
        }}
      />
    </div>
  );
}
