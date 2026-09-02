import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // middleware.ts already protects /dashboard/*, this is a second
  // safety check in case the layout is ever rendered without it.
  if (!session?.user) {
    redirect("/login");
  }

  const { role, name } = session.user;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col">
        <Topbar name={name ?? "User"} role={role} />
        <main className="flex-1 bg-slate-50 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
