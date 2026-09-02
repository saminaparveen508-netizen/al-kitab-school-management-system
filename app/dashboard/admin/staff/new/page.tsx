import { StaffForm } from "../staff-form";
import { createStaff } from "../actions";

export default function NewStaffPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Staff</h1>
        <p className="text-sm text-slate-500">
          Naye staff member ki details bharein — ek login account bhi
          automatically ban jayega.
        </p>
      </div>

      <StaffForm action={createStaff} submitLabel="Add Staff" />
    </div>
  );
}
