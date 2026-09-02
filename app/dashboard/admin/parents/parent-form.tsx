"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionResult } from "./actions";

// ==========================================================
// One shared form for both "Add Parent" and "Edit Parent",
// following the same pattern as Students/Staff modules.
// ==========================================================

export interface ParentFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  isEdit?: boolean;
  defaultValues?: {
    name?: string;
    email?: string;
    fatherName?: string;
    motherName?: string;
    cnic?: string;
    occupation?: string;
    address?: string;
  };
  submitLabel?: string;
}

export function ParentForm({
  action,
  isEdit = false,
  defaultValues,
  submitLabel = "Save Parent",
}: ParentFormProps) {
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
                  placeholder="e.g. Muhammad Aslam"
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
                  placeholder="e.g. parent@example.com"
                  defaultValue={defaultValues?.email}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
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
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Guardian Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fatherName">Father&apos;s Name</Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  placeholder="e.g. Muhammad Aslam"
                  defaultValue={defaultValues?.fatherName}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="motherName">Mother&apos;s Name</Label>
                <Input
                  id="motherName"
                  name="motherName"
                  placeholder="e.g. Sadia Aslam"
                  defaultValue={defaultValues?.motherName}
                />
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
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  placeholder="e.g. Business, Teacher, Farmer"
                  defaultValue={defaultValues?.occupation}
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
            <Link href="/dashboard/admin/parents">
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
