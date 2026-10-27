"use server";

import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pushAdminNotification } from "@/lib/admin-notify";
import { signImpersonation } from "@/lib/totp";

// "Sign in as" lets an admin open a customer's dashboard to see exactly what
// the customer sees. The session carries who is behind it, a banner is always
// shown, and one click returns the admin to their own account.
//
// Guards: only an admin can start it, never on another admin, and every use is
// recorded in the admin notification centre.

export async function impersonateUserAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" || session.user.impersonatedBy) {
    throw new Error("Forbidden");
  }

  const userId = String(formData.get("userId") ?? "");
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found.");
  if (target.role === "ADMIN") throw new Error("Admins cannot be impersonated.");

  await pushAdminNotification({
    type: "SYSTEM",
    title: `Signed in as ${target.name}`,
    body: `${session.user.email} opened the dashboard of ${target.email}.`,
    href: "/admin/users",
  });

  await signIn("credentials", {
    impersonation: signImpersonation(target.id, session.user.id),
    redirect: false,
  });

  redirect("/dashboard");
}

/** Back to the admin's own account, from the banner. */
export async function stopImpersonatingAction(): Promise<void> {
  const session = await auth();
  const adminId = session?.user?.impersonatedBy;
  if (!adminId) redirect("/dashboard");

  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== "ADMIN") throw new Error("Forbidden");

  await signIn("credentials", {
    impersonation: signImpersonation(admin.id, admin.id),
    redirect: false,
  });

  redirect("/admin/users");
}
