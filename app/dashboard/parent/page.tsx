import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ParentDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Parent Overview
        </h1>
        <p className="text-sm text-slate-500">
          Apne bachon ki attendance aur progress yahan dekhein.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Yahan aapke bachon ki list, attendance record aur school notices
            dikhaye jayenge. Yeh section next steps mein banaya jayega.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-500">
          Coming next: children list, attendance history, fee & notices.
        </CardContent>
      </Card>
    </div>
  );
}
