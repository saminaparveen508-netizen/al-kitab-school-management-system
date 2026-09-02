"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActionResult } from "./actions";

// ==========================================================
// One shared form for both "Add Subject" and "Edit Subject".
// Teacher assignment uses a checkbox list rather than a native
// <select multiple> — much easier to use, and the form posts
// every checked value under the same "teacherIds" field name.
// ==========================================================

export interface SubjectFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  className: string;
  teacherOptions: { id: string; name: string; designation: string | null }[];
  defaultValues?: {
    name?: string;
    code?: string;
    teacherIds?: string[];
  };
  submitLabel?: string;
}

export function SubjectForm({
  action,
  className,
  teacherOptions,
  defaultValues,
  submitLabel = "Save Subject",
}: SubjectFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Set<string>>(
    new Set(defaultValues?.teacherIds ?? [])
  );

  function toggleTeacher(id: string) {
    setSelectedTeacherIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    startTransition(async () => {
      const result = await action(formData);
      if (result && !result.success) {
        setError(result.error ?? "Kuch ghalat ho gaya, dobara koshish karein.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="mb-4 text-sm text-slate-500">
          Class: <span className="font-medium text-slate-900">{className}</span>
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Subject ka Naam *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. English, Urdu, Mathematics"
                defaultValue={defaultValues?.name}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g. ENG-1, URD-1"
                defaultValue={defaultValues?.code}
                required
              />
            </div>
          </div>

          <div>
            <Label>Teachers Assign Karein</Label>
            <p className="mb-2 text-xs text-slate-500">
              Jo teacher yeh subject parhayenge unhein select karein (ek se
              zyada select ho sakte hain).
            </p>

            {teacherOptions.length === 0 ? (
              <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-400">
                Abhi koi staff record nahi hai. Pehle &ldquo;Staff&rdquo; page se
                teacher add karein.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-2">
                {teacherOptions.map((teacher) => {
                  const isChecked = selectedTeacherIds.has(teacher.id);
                  return (
                    <label
                      key={teacher.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                        isChecked ? "bg-emerald-50" : "hover:bg-slate-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        name="teacherIds"
                        value={teacher.id}
                        checked={isChecked}
                        onChange={() => toggleTeacher(teacher.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                      />
                      <span className="text-slate-900">{teacher.name}</span>
                      {teacher.designation && (
                        <span className="text-xs text-slate-400">
                          ({teacher.designation})
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Save ho raha hai..." : submitLabel}
            </Button>
            <Link href="/dashboard/admin/subjects">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
