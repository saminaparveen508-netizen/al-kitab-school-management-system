import { ParentForm } from "../parent-form";
import { createParent } from "../actions";

export default function NewParentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Parent</h1>
        <p className="text-sm text-slate-500">
          Naye parent/guardian ki details bharein — ek login account bhi
          automatically ban jayega. Bacchay is parent se &ldquo;Students&rdquo;
          page se link kiye ja sakte hain.
        </p>
      </div>

      <ParentForm action={createParent} submitLabel="Add Parent" />
    </div>
  );
}
