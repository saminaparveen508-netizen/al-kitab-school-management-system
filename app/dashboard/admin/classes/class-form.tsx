"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionResult } from "./actions";

export interface ClassFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  defaultValues?: { name?: string };
  submitLabel?: string;
}

export function ClassForm({
  action,
  defaultValues,
  submitLabel = "Save Class",
}: ClassFormProps) {
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
          <div className="flex flex-col gap-1.5 max-w-sm">
            <Label htmlFor="name">Class ka Naam *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Class 9, Montessori"
              defaultValue={defaultValues?.name}
              required
            />
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
            <Link href="/dashboard/admin/classes">
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
