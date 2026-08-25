import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import ResendVerificationForm from "./ResendVerificationForm";

export default async function VerifyEmailPendingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.verified) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-20">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-4xl">📬</div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Verify your email</h1>
        <p className="mt-3 text-sm text-slate-300">
          We sent a verification link to <strong>{session.user.email}</strong>. Click it to
          activate your account — you'll need to verify before you can place orders or add funds.
        </p>

        <div className="mt-6">
          <ResendVerificationForm />
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-4"
        >
          <button className="text-sm text-slate-400 hover:text-brand hover:underline">
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
