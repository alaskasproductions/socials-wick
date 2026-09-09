import { auth } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import { prisma } from "@/lib/prisma";

export default async function DashboardAccountPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { totpEnabled: true, totpEnabledAt: true },
      })
    : null;

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
