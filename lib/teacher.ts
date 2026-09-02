import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ==========================================================
// Small helper used by every Teacher-only page: it finds the
// Staff record linked to the currently logged-in user, along
// with the sections they are the class-teacher of. Returns
// null if, for some reason, no Staff record exists yet.
// ==========================================================

export async function getCurrentTeacherStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const staff = await prisma.staff.findUnique({
    where: { userId: session.user.id },
    include: {
      sectionsInCharge: {
        include: {
          class: true,
          students: { orderBy: { fullName: "asc" } },
        },
        orderBy: { class: { order: "asc" } },
      },
    },
  });

  return staff;
}
