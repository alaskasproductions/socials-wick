import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PREAUTH_COOKIE, PREAUTH_TTL_SECONDS, verifyPreauth } from "@/lib/totp";

export const metadata: Metadata = {
  title: "Two-factor authentication",
  robots: { index: false, follow: false },
};

export default async function TwoFactorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userId = verifyPreauth(cookieStore.get(PREAUTH_COOKIE)?.value);
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.totpEnabled) redirect("/login");
  const destination = user.emailVerifiedAt ? "/" : "/verify-email/pending";

  async function verify(formData: FormData) {
    "use server";
    const store = await cookies();
    const token = store.get(PREAUTH_COOKIE)?.value;
    if (!token || !verifyPreauth(token)) redirect("/login");

    // The token is single-use for a successful login; it is restored on a
    // wrong code so the user can retry without re-entering the password.
    store.delete(PREAUTH_COOKIE);
    try {
      await signIn("credentials", {
        preauth: token,
        code: String(formData.get("code") ?? ""),
        redirectTo: destination,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        store.set(PREAUTH_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: PREAUTH_TTL_SECONDS,
        });
        redirect("/login/2fa?error=1");
      }
      throw err;
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-20">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-foreground">Two-factor authentication 🔐</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter the 6-digit code from your authenticator app for{" "}
          <span className="text-slate-200">{user.email}</span>.
        </p>

        {params.error && (
          <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">
            That code is not valid. Codes change every 30 seconds — try the current one.
          </p>
        )}

        <form action={verify} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-200">Authentication code</label>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              required
              autoFocus
              placeholder="123 456"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-lg tracking-[0.3em] text-foreground placeholder:tracking-normal placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Verify
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Lost your device? Contact support to have two-factor authentication reset.{" "}
          <Link href="/login" className="text-brand hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
