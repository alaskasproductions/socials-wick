import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
      verified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "CUSTOMER";
    verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "CUSTOMER";
    verified?: boolean;
  }
}
