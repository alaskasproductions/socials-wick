import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { decryptSecret, verifyPreauth, verifyTotp } from "@/lib/totp";
import type { User } from "@prisma/client";

function toAuthUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    verified: Boolean(user.emailVerifiedAt),
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Trust the Host header from the reverse proxy in front of the app
  // (Hostinger, or any host where AUTH_URL isn't pinned to one fixed
  // domain). Safe here since we don't run behind untrusted proxies.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // Second step for accounts with an authenticator enabled: the login
        // action verifies the password, issues a signed pre-auth token, and
        // /login/2fa exchanges token + 6-digit code for the session.
        preauth: { type: "text" },
        code: { type: "text" },
      },
      authorize: async (credentials) => {
        const preauth = credentials?.preauth as string | undefined;
        if (preauth) {
          const userId = verifyPreauth(preauth);
          if (!userId) return null;
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (!user || user.status === "BANNED" || !user.totpEnabled || !user.totpSecret) return null;
          const code = String(credentials?.code ?? "");
          if (!verifyTotp(decryptSecret(user.totpSecret), code)) return null;
          return toAuthUser(user);
        }

        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.status === "BANNED") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        // Password alone never signs in an account that has 2FA enabled.
        if (user.totpEnabled) return null;

        return toAuthUser(user);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id as string;
        token.verified = (user as { verified: boolean }).verified;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
        session.user.verified = token.verified as boolean;
      }
      return session;
    },
  },
});
