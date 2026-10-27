import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
      verified: boolean;
      /** Set while an admin is signed in as this customer. */
      impersonatedBy?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "CUSTOMER";
    verified?: boolean;
    impersonatedBy?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "CUSTOMER";
    verified?: boolean;
    impersonatedBy?: string;
  }
}
