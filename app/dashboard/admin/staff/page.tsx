import Link from "next/link";
import { Plus, Pencil, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DeleteStaffButton } from "./delete-button";

// ==========================================================
// Admin > Staff > List
// Supports search by name/email/employee code (?q=) and a
// staff-type filter (?type=TEACHING|NON_TEACHING).
// ==========================================================

interface StaffListItem {
  id: string;
  employeeCode: string;
  staffType: string;
  designation: string | null;
  user: { name: string; email: string; role: string };
}

export default async function StaffListPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const type = searchParams.type ?? "";

  const staff = await prisma.staff.findMany({
    where: {
      AND: [
        type ? { staffType: type as "TEACHING" | "NON_TEACHING" } : {},
        query
          ? {
              OR: [
                { employeeCode: { contains: query, mode: "insensitive" } },
                { user: { name: { contains: query, mode: "insensitive" } } },
                { user: { email: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    },
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Staff</h1>
          <p className="text-sm text-slate-500">
            Total {staff.length} staff member{staff.length !== 1 && "s"} record mein
          </p>
        </div>
        <Link href="/dashboard/admin/staff/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            name="q"
            placeholder="Naam, email ya employee code search karein..."
            defaultValue={query}
            className="pl-9"
          />
        </div>
        <Select name="type" defaultValue={type} className="max-w-[180px]">
          <option value="">Sab Staff Types</option>
          <option value="TEACHING">Teaching</option>
          <option value="NON_TEACHING">Non-Teaching</option>
        </Select>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Employee Code</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Login Role</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-slate-400">
                Koi staff member nahi mila. &ldquo;Add Staff&rdquo; button se naya staff shamil karein.
              </TableCell>
            </TableRow>
          )}

          {staff.map((member: StaffListItem) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium text-slate-900">
                {member.user.name}
              </TableCell>
              <TableCell>{member.employeeCode}</TableCell>
              <TableCell>
                {member.designation ?? <span className="text-slate-400">—</span>}
              </TableCell>
              <TableCell>
                {member.staffType === "TEACHING" ? "Teaching" : "Non-Teaching"}
              </TableCell>
              <TableCell>
                {member.user.role.charAt(0) + member.user.role.slice(1).toLowerCase()}
              </TableCell>
              <TableCell className="text-slate-500">{member.user.email}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/admin/staff/${member.id}/edit`}>
                    <Button type="button" variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteStaffButton
                    staffId={member.id}
                    staffName={member.user.name}
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
