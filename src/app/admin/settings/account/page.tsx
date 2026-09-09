import { auth } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import { prisma } from "@/lib/prisma";

export default async function AdminAccountSettingsPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { totpEnabled: true, totpEnabledAt: true },
      })
    : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Change the password of the admin account you are signed in as ({session?.user?.email}).
      </p>

      <div className="glass max-w-md rounded-xl p-6">
        <ChangePasswordForm />
      </div>

      <div className="glass max-w-md rounded-xl p-6">
        <h3 className="text-base font-semibold text-foreground">Two-factor authentication</h3>
        <div className="mt-4">
          <TwoFactorSettings
            enabled={Boolean(user?.totpEnabled)}
            enabledAt={user?.totpEnabledAt?.toISOString() ?? null}
          />
        </div>
      </div>
    </div>
  );
}
