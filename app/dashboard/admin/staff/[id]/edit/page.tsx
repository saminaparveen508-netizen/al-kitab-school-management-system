import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StaffForm } from "../../staff-form";
import { updateStaff } from "../../actions";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export default async function EditStaffPage({
  params,
}: {
  params: { id: string };
}) {
  const staff = await prisma.staff.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!staff) {
    notFound();
  }

  const boundUpdateStaff = updateStaff.bind(null, staff.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Edit Staff</h1>
        <p className="text-sm text-slate-500">
          {staff.user.name} ({staff.employeeCode}) ki details update karein.
        </p>
      </div>

      <StaffForm
        action={boundUpdateStaff}
        isEdit
        submitLabel="Update Staff"
        defaultValues={{
          name: staff.user.name,
          email: staff.user.email,
          role: staff.user.role,
          employeeCode: staff.employeeCode,
          staffType: staff.staffType,
          designation: staff.designation ?? "",
          qualification: staff.qualification ?? "",
          gender: staff.gender ?? "",
          cnic: staff.cnic ?? "",
          address: staff.address ?? "",
          joiningDate: toDateInputValue(staff.joiningDate),
          salary: staff.salary ? staff.salary.toString() : "",
        }}
      />
    </div>
  );
}
