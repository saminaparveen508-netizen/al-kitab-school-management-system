"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "./actions";

export function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = window.confirm(
      `Kya aap "${studentName}" ka record delete karna chahte hain? Yeh wapis nahi ho sakega.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteStudent(studentId);
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
