import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stopImpersonatingAction } from "@/lib/actions/impersonation";

// Always visible while an admin is signed in as a customer, so nobody can
// forget whose account they are looking at.
export default async function ImpersonationBanner() {
  const session = await auth();
  const adminId = session?.user?.impersonatedBy;
  if (!adminId) return null;

  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { email: true } });

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black">
      <span>
        👤 You are signed in as {session?.user?.name} ({session?.user?.email}).
        {admin?.email ? ` Your admin account is ${admin.email}.` : ""}
      </span>
      <form action={stopImpersonatingAction}>
        <button className="rounded-lg bg-black/80 px-3 py-1 text-xs font-semibold text-white hover:bg-black">
          Back to admin
        </button>
      </form>
    </div>
  );
}
