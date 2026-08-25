import Link from "next/link";
import { consumeEmailVerificationToken } from "@/lib/actions/auth";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await consumeEmailVerificationToken(token ?? "");

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-20">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-4xl">{result.success ? "✅" : "⚠️"}</div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          {result.success ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="mt-3 text-sm text-slate-300">{result.message}</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Go to Login
          </Link>
          {!result.success && (
            <Link
              href="/verify-email/pending"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              Resend Email
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
