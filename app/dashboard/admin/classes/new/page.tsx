import { ClassForm } from "../class-form";
import { createClass } from "../actions";

export default function NewClassPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Class</h1>
        <p className="text-sm text-slate-500">
          Nayi class school mein shamil karein. Yeh list ke aakhir mein add ho
          jayegi.
        </p>
      </div>

      <ClassForm action={createClass} submitLabel="Add Class" />
    </div>
  );
}
