"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteClass } from "./actions";

export function DeleteClassButton({
  classId,
  className,
  sectionCount,
}: {
  classId: string;
  className: string;
  sectionCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    const extraWarning =
      sectionCount > 0
        ? ` Iske ${sectionCount} section bhi delete ho jayenge aur unke students unassign ho jayenge.`
        : "";

    const confirmed = window.confirm(
      `Kya aap "${className}" class delete karna chahte hain?${extraWarning} Yeh wapis nahi ho sakega.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteClass(classId);
      if (!result.success) {
        setError(result.error ?? "Delete nahi ho saka");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
