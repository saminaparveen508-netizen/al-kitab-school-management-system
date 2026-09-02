import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Teacher Overview
        </h1>
        <p className="text-sm text-slate-500">
          Apni classes, students aur attendance yahan se manage karein.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Yahan aapko apni assigned classes aur subjects dikhayi denge. Yeh
            section next steps mein banaya jayega.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-500">
          Coming next: class list, attendance marking, subject-wise students.
        </CardContent>
      </Card>
    </div>
  );
}
