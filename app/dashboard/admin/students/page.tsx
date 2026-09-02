import Link from "next/link";
import { Plus, Pencil, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DeleteStudentButton } from "./delete-button";

// ==========================================================
// Admin > Students > List
// Supports a simple search by name or roll number via ?q=
// ==========================================================

interface StudentListItem {
  id: string;
  fullName: string;
  rollNumber: string;
  gender: string | null;
  section: { name: string; class: { name: string } } | null;
  parent: { user: { name: string } } | null;
}

export default async function StudentsListPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";

  const students = await prisma.student.findMany({
    where: query
      ? {
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { rollNumber: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      section: { include: { class: true } },
      parent: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500">
            Total {students.length} student{students.length !== 1 && "s"}{" "}
            record mein
          </p>
        </div>
        <Link href="/dashboard/admin/students/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <form className="flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            name="q"
            placeholder="Naam ya Roll Number search karein..."
            defaultValue={query}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Roll No.</TableHead>
            <TableHead>Class / Section</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                Koi student nahi mila. &ldquo;Add Student&rdquo; button se naya student shamil karein.
              </TableCell>
            </TableRow>
          )}

          {students.map((student: StudentListItem) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium text-slate-900">
                {student.fullName}
              </TableCell>
              <TableCell>{student.rollNumber}</TableCell>
              <TableCell>
                {student.section
                  ? `${student.section.class.name} - ${student.section.name}`
                  : <span className="text-slate-400">Not assigned</span>}
              </TableCell>
              <TableCell>
                {student.parent?.user.name ?? (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell>
                {student.gender
                  ? student.gender.charAt(0) + student.gender.slice(1).toLowerCase()
                  : <span className="text-slate-400">—</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/admin/students/${student.id}/edit`}>
                    <Button type="button" variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteStudentButton
                    studentId={student.id}
                    studentName={student.fullName}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
