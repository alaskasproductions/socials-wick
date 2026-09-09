"use server";

import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  decryptSecret,
  encryptSecret,
  formatSecret,
  generateTotpSecret,
  otpauthUrl,
  verifyTotp,
} from "@/lib/totp";

export type ActionState = { error?: string; success?: string } | undefined;
export type TotpSetup = { secret: string; qrDataUrl: string };

const ISSUER = "Socials Wick";

async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

function revalidateAccountPages() {
  revalidatePath("/dashboard/account");
  revalidatePath("/admin/settings/account");
}

/** Generates a fresh secret, stores it as a pending (unconfirmed) setup and returns the QR. */
export async function startTotpSetupAction(): Promise<{ error?: string; setup?: TotpSetup }> {
  const user = await currentUser();
  if (!user) return { error: "You need to be signed in." };
  if (user.totpEnabled) return { error: "Two-factor authentication is already enabled." };

  const secret = generateTotpSecret();
  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: encryptSecret(secret), totpEnabled: false, totpEnabledAt: null },
  });

  const qrDataUrl = await QRCode.toDataURL(otpauthUrl(ISSUER, user.email, secret), {
    margin: 1,
    width: 220,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  return { setup: { secret: formatSecret(secret), qrDataUrl } };
}

/** Confirms the pending setup with a code from the app and turns 2FA on. */
export async function confirmTotpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "You need to be signed in." };
  if (user.totpEnabled) return { error: "Two-factor authentication is already enabled." };
  if (!user.totpSecret) return { error: "Start the setup first to get a QR code." };

  const code = String(formData.get("code") ?? "");
  if (!verifyTotp(decryptSecret(user.totpSecret), code)) {
    return {
      error: "That code is not valid. Make sure your phone's clock is correct and try the current code.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: true, totpEnabledAt: new Date() },
  });
  revalidateAccountPages();
  return { success: "Two-factor authentication is on. You'll be asked for a code at every login." };
}

/** Drops an unconfirmed secret (user closed the setup). */
export async function cancelTotpSetupAction(): Promise<void> {
  const user = await currentUser();
  if (!user || user.totpEnabled) return;
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null } });
}

/** Turns 2FA off; requires the account password. */
export async function disableTotpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "You need to be signed in." };
  if (!user.totpEnabled) return { error: "Two-factor authentication is not enabled." };

  const password = String(formData.get("password") ?? "");
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Incorrect password." };

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: null, totpEnabled: false, totpEnabledAt: null },
  });
  revalidateAccountPages();
  return { success: "Two-factor authentication has been turned off." };
}
