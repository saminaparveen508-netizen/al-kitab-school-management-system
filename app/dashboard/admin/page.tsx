import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GraduationCap, UserCog, School } from "lucide-react";

export default async function AdminDashboard() {
  // Simple counts for the overview cards. Safe to call even before
  // any data exists — Prisma just returns 0.
  const [studentCount, parentCount, staffCount, classCount] =
    await Promise.all([
      prisma.student.count(),
      prisma.parent.count(),
      prisma.staff.count(),
      prisma.class.count(),
    ]);

  const stats = [
    { label: "Total Students", value: studentCount, icon: GraduationCap },
    { label: "Total Parents", value: parentCount, icon: Users },
    { label: "Total Staff", value: staffCount, icon: UserCog },
    { label: "Classes", value: classCount, icon: School },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Admin Overview
        </h1>
        <p className="text-sm text-slate-500">
          Al-Kitab Public Elementary School, Jhang — Pre-Nursery to Class 8
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between pt-5">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Yeh naya school management system hai. Agle steps mein students,
            staff, classes aur attendance ke management pages banaye jayenge.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
