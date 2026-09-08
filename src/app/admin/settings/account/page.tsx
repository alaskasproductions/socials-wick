import { auth } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function AdminAccountSettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Change the password of the admin account you are signed in as ({session?.user?.email}).
      </p>

      <div className="glass max-w-md rounded-xl p-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
