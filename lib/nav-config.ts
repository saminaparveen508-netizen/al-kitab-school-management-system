import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCog,
  ClipboardList,
  CalendarCheck,
  School,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Menu items shown in the sidebar, per role.
// Add/remove items here as new pages are built.

export const navConfig: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Students", href: "/dashboard/admin/students", icon: GraduationCap },
    { label: "Parents", href: "/dashboard/admin/parents", icon: Users },
    { label: "Staff", href: "/dashboard/admin/staff", icon: UserCog },
    { label: "Classes & Sections", href: "/dashboard/admin/classes", icon: School },
    { label: "Subjects", href: "/dashboard/admin/subjects", icon: BookOpen },
    { label: "Attendance", href: "/dashboard/admin/attendance", icon: CalendarCheck },
  ],
  TEACHER: [
    { label: "Overview", href: "/dashboard/teacher", icon: LayoutDashboard },
    { label: "My Classes", href: "/dashboard/teacher/classes", icon: School },
    { label: "My Students", href: "/dashboard/teacher/students", icon: GraduationCap },
    { label: "Attendance", href: "/dashboard/teacher/attendance", icon: CalendarCheck },
    { label: "Subjects", href: "/dashboard/teacher/subjects", icon: BookOpen },
  ],
  PARENT: [
    { label: "Overview", href: "/dashboard/parent", icon: LayoutDashboard },
    { label: "My Children", href: "/dashboard/parent/children", icon: GraduationCap },
    { label: "Attendance", href: "/dashboard/parent/attendance", icon: CalendarCheck },
    { label: "Fee & Notices", href: "/dashboard/parent/notices", icon: ClipboardList },
  ],
  STUDENT: [
    { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/student/profile", icon: User },
    { label: "Attendance", href: "/dashboard/student/attendance", icon: CalendarCheck },
    { label: "Subjects", href: "/dashboard/student/subjects", icon: BookOpen },
  ],
};
