"use client";

import { signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ name, role }: { name: string; role: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button className="md:hidden">
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Assalam-o-Alaikum, {name}
          </p>
          <p className="text-xs text-slate-500">
            {role.charAt(0) + role.slice(1).toLowerCase()} Dashboard
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}
