import { auth } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function DashboardAccountPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Account</h2>
        <p className="mt-1 text-sm text-slate-400">Signed in as {session?.user?.email}</p>
      </div>

      <div className="glass max-w-md rounded-xl p-6">
        <h3 className="text-base font-semibold text-foreground">Change password</h3>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
