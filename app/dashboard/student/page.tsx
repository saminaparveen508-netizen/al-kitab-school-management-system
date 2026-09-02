import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudentDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Student Overview
        </h1>
        <p className="text-sm text-slate-500">
          Apna profile, attendance aur subjects yahan dekhein.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Yahan aapka profile, attendance record aur subjects ki list
            dikhayi jayegi. Yeh section next steps mein banaya jayega.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-500">
          Coming next: profile page, attendance history, subject list.
        </CardContent>
      </Card>
    </div>
  );
}
