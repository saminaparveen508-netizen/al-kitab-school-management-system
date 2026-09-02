"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionResult } from "./actions";

// ==========================================================
// One shared form for both "Add Student" and "Edit Student".
// It receives the server action to run on submit (createStudent
// directly, or updateStudent already bound with the student's id
// via .bind(null, studentId)) plus dropdown data and any existing
// values.
//
// NOTE: We call the server action directly from a client event
// handler (inside startTransition) instead of using the
// `useFormState` hook — that hook needs a React canary build,
// while this approach works with the stable React 18 that
// Next.js 14 ships with.
// ==========================================================

export interface ClassOption {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

export interface ParentOption {
  id: string;
  name: string;
}

export interface StudentFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  classes: ClassOption[];
  parents: ParentOption[];
  defaultValues?: {
    fullName?: string;
    rollNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    bFormOrCnic?: string;
    address?: string;
    admissionDate?: string;
    classId?: string;
    sectionId?: string;
    parentId?: string;
  };
  submitLabel?: string;
}

export function StudentForm({
  action,
  classes,
  parents,
  defaultValues,
  submitLabel = "Save Student",
}: StudentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState(
    defaultValues?.classId ?? ""
  );

  const sectionsForClass =
    classes.find((c) => c.id === selectedClassId)?.sections ?? [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    startTransition(async () => {
      const result = await action(formData);
      // On success the server action calls redirect() itself, which
      // throws internally and never returns a value here — so we
      // only ever reach this line when something went wrong.
      if (result && !result.success) {
        setError(result.error ?? "Kuch ghalat ho gaya, dobara koshish karein.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Bacchay ka Naam *</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="e.g. Ali Aslam"
                defaultValue={defaultValues?.fullName}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                name="rollNumber"
                placeholder="e.g. AK-0021"
                defaultValue={defaultValues?.rollNumber}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select
                id="gender"
                name="gender"
                defaultValue={defaultValues?.gender ?? ""}
              >
                <option value="">-- Select --</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={defaultValues?.dateOfBirth}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bFormOrCnic">B-Form / CNIC Number</Label>
              <Input
                id="bFormOrCnic"
                name="bFormOrCnic"
                placeholder="e.g. 33202-1234567-1"
                defaultValue={defaultValues?.bFormOrCnic}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admissionDate">Admission Date</Label>
              <Input
                id="admissionDate"
                name="admissionDate"
                type="date"
                defaultValue={defaultValues?.admissionDate}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="classId">Class</Label>
              <Select
                id="classId"
                name="classId"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sectionId">Section</Label>
              <Select
                id="sectionId"
                name="sectionId"
                defaultValue={defaultValues?.sectionId ?? ""}
                disabled={!selectedClassId}
              >
                <option value="">-- Select Section --</option>
                {sectionsForClass.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="parentId">Parent / Guardian</Label>
              <Select
                id="parentId"
                name="parentId"
                defaultValue={defaultValues?.parentId ?? ""}
              >
                <option value="">-- Select Parent --</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="House #, Street, Jhang"
                defaultValue={defaultValues?.address}
              />
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
            <Link href="/dashboard/admin/students">
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
