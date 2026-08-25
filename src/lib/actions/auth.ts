"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import * as mail from "@/lib/mail";
import { auth } from "@/lib/auth";

export type RegisterState = { error?: string } | undefined;

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "CUSTOMER", balance: 0 },
  });

  await sendVerificationEmail(user);

  redirect("/login?registered=1");
}

export type PasswordResetState = { error?: string; success?: string } | undefined;

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordResetAction(
  _prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "Enter your email address." };

  // Always return the same message whether or not the account exists, so
  // this form can't be used to enumerate registered emails.
  const genericSuccess = {
    success: "If an account exists for that email, we've sent a password reset link.",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return genericSuccess;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
  ]);

  const origin = await getOrigin();
  const resetUrl = `${origin}/reset-password?token=${rawToken}`;

  try {
    await mail.sendMail({
      to: user.email,
      subject: "Reset your Socials Wick password",
      html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    });
  } catch {
    return {
      error:
        "We couldn't send the reset email right now. Please try again shortly or contact support.",
    };
  }

  return genericSuccess;
}

export async function resetPasswordAction(
  _prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) return { error: "Missing reset token." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=1");
}

// ---- Email verification ----

async function sendVerificationEmail(user: { id: string; name: string; email: string }) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
  ]);

  const origin = await getOrigin();
  const verifyUrl = `${origin}/verify-email?token=${rawToken}`;

  try {
    await mail.sendMail({
      to: user.email,
      subject: "Verify your Socials Wick account",
      html: `<p>Hi ${user.name},</p><p>Welcome to Socials Wick! Click the link below to verify your email and activate your account. This link expires in 24 hours.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });
  } catch (err) {
    // Registration still succeeds even if the email fails to send — the
    // user can request another one from the "verify your email" page.
    console.error(
      "[auth] failed to send verification email:",
      err instanceof Error ? err.message : err
    );
  }
}

export type VerifyEmailResult = { success: boolean; message: string };

// Called directly from the /verify-email Server Component when it loads
// with a ?token= — not a form action, since visiting the link should verify
// immediately without an extra click.
export async function consumeEmailVerificationToken(token: string): Promise<VerifyEmailResult> {
  if (!token) return { success: false, message: "Missing verification token." };

  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      success: false,
      message: "This verification link is invalid or has expired. Request a new one below.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true, message: "Your email has been verified. You can now log in." };
}

export async function resendVerificationEmailAction(
  _prevState: PasswordResetState,
  _formData: FormData
): Promise<PasswordResetState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };
  if (user.emailVerifiedAt) return { success: "Your email is already verified." };

  await sendVerificationEmail(user);
  return { success: "Verification email sent. Check your inbox." };
}
