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
// One shared form for both "Add Staff" and "Edit Staff",
// following the same pattern as the Students module. See
// student-form.tsx for the fuller explanation of the
// startTransition + server action approach used here.
// ==========================================================

export interface StaffFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  isEdit?: boolean;
  defaultValues?: {
    name?: string;
    email?: string;
    role?: string;
    employeeCode?: string;
    staffType?: string;
    designation?: string;
    qualification?: string;
    gender?: string;
    cnic?: string;
    address?: string;
    joiningDate?: string;
    salary?: string;
  };
  submitLabel?: string;
}

export function StaffForm({
  action,
  isEdit = false,
  defaultValues,
  submitLabel = "Save Staff",
}: StaffFormProps) {
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
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Login Account
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Poora Naam *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Ayesha Bibi"
                  defaultValue={defaultValues?.name}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. teacher@alkitabschool.edu.pk"
                  defaultValue={defaultValues?.email}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">
                  Password {isEdit ? "(khali chorein agar tabdeel na karni ho)" : "*"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isEdit ? "••••••••" : "Kam az kam 6 harf"}
                  required={!isEdit}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="role">Login Role *</Label>
                <Select
                  id="role"
                  name="role"
                  defaultValue={defaultValues?.role ?? "TEACHER"}
                  required
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Staff Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="employeeCode">Employee Code *</Label>
                <Input
                  id="employeeCode"
                  name="employeeCode"
                  placeholder="e.g. EMP-0003"
                  defaultValue={defaultValues?.employeeCode}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="staffType">Staff Type *</Label>
                <Select
                  id="staffType"
                  name="staffType"
                  defaultValue={defaultValues?.staffType ?? "TEACHING"}
                  required
                >
                  <option value="TEACHING">Teaching</option>
                  <option value="NON_TEACHING">Non-Teaching</option>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  placeholder="e.g. Class Teacher, Principal, Peon"
                  defaultValue={defaultValues?.designation}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  name="qualification"
                  placeholder="e.g. B.Ed, M.A"
                  defaultValue={defaultValues?.qualification}
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
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  name="cnic"
                  placeholder="e.g. 33202-1234567-1"
                  defaultValue={defaultValues?.cnic}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  defaultValue={defaultValues?.joiningDate}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="salary">Salary (PKR)</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 25000"
                  defaultValue={defaultValues?.salary}
                />
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
            <Link href="/dashboard/admin/staff">
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
