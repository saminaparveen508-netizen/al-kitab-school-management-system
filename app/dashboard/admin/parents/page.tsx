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
import { DeleteParentButton } from "./delete-button";

// ==========================================================
// Admin > Parents > List
// Supports search by name/email/CNIC via ?q=
// ==========================================================

interface ParentListItem {
  id: string;
  cnic: string | null;
  occupation: string | null;
  user: { name: string; email: string };
  children: { id: string }[];
}

export default async function ParentsListPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";

  const parents = await prisma.parent.findMany({
    where: query
      ? {
          OR: [
            { user: { name: { contains: query, mode: "insensitive" } } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            { cnic: { contains: query, mode: "insensitive" } },
          ],
        }
      : {},
    include: {
      user: { select: { name: true, email: true } },
      children: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Parents</h1>
          <p className="text-sm text-slate-500">
            Total {parents.length} parent{parents.length !== 1 && "s"} record mein
          </p>
        </div>
        <Link href="/dashboard/admin/parents/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Parent
          </Button>
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            name="q"
            placeholder="Naam, email ya CNIC search karein..."
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
            <TableHead>Email</TableHead>
            <TableHead>CNIC</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Children</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                Koi parent nahi mila. &ldquo;Add Parent&rdquo; button se naya parent shamil karein.
              </TableCell>
            </TableRow>
          )}

          {parents.map((parent: ParentListItem) => (
            <TableRow key={parent.id}>
              <TableCell className="font-medium text-slate-900">
                {parent.user.name}
              </TableCell>
              <TableCell className="text-slate-500">{parent.user.email}</TableCell>
              <TableCell>
                {parent.cnic ?? <span className="text-slate-400">—</span>}
              </TableCell>
              <TableCell>
                {parent.occupation ?? <span className="text-slate-400">—</span>}
              </TableCell>
              <TableCell>{parent.children.length}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/admin/parents/${parent.id}/edit`}>
                    <Button type="button" variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteParentButton
                    parentId={parent.id}
                    parentName={parent.user.name}
                    childrenCount={parent.children.length}
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
