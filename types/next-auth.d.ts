import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

// Extend NextAuth's built-in types so `session.user.role` and
// `session.user.id` are known everywhere in the app with TypeScript.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
