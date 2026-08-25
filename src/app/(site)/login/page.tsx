import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string; reset?: string }>;
}) {
  const params = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      const destination = user && !user.emailVerifiedAt ? "/verify-email/pending" : "/";

      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: destination,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw err;
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-20">
    <div className="glass rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-foreground">Welcome back 👋</h1>
      <p className="mt-2 text-sm text-slate-400">
        Login to your Socials Wick account and manage your campaigns.
      </p>

      {params.registered && (
        <p className="mt-4 rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
          Account created. Check your email to verify your account, then log in.
        </p>
      )}
      {params.reset && (
        <p className="mt-4 rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
          Password updated. You can now log in with your new password.
        </p>
      )}
      {params.error && (
        <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">
          Invalid email or password.
        </p>
      )}

      <form action={login} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-200">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-200">Password</label>
            <Link href="/forgot-password" className="text-xs text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        New user?{" "}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Register
        </Link>
      </p>

      <div className="mt-6 rounded-lg bg-white/5 px-4 py-3 text-xs text-slate-400">
        Demo admin: <strong>admin@socialswick.com</strong> / <strong>admin123</strong>
        <br />
        Demo customer: <strong>demo@socialswick.com</strong> / <strong>demo1234</strong>
      </div>
    </div>
    </div>
  );
}
