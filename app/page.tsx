import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const roleHome: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  PARENT: "/dashboard/parent",
  STUDENT: "/dashboard/student",
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role) {
    redirect(roleHome[session.user.role] ?? "/login");
  }

  redirect("/login");
}
