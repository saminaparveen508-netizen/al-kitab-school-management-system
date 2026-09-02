"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionResult } from "../../actions";

export interface SectionFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  className: string;
  teacherOptions: { id: string; name: string }[];
  defaultValues?: {
    name?: string;
    classTeacherId?: string;
    capacity?: string;
  };
  submitLabel?: string;
  cancelHref: string;
}

export function SectionForm({
  action,
  className,
  teacherOptions,
  defaultValues,
  submitLabel = "Save Section",
  cancelHref,
}: SectionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
              <Label htmlFor="name">Section ka Naam *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. A, B, C"
                defaultValue={defaultValues?.name}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder="e.g. 40"
                defaultValue={defaultValues?.capacity}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="classTeacherId">Class Teacher</Label>
              <Select
                id="classTeacherId"
                name="classTeacherId"
                defaultValue={defaultValues?.classTeacherId ?? ""}
              >
                <option value="">-- Koi teacher assign nahi --</option>
                {teacherOptions.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </Select>
            </div>
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
            <Link href={cancelHref}>
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
