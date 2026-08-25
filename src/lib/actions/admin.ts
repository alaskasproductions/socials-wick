"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as notify from "@/lib/notifications";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

export type ActionState = { error?: string; success?: string } | undefined;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---- Categories ----

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  await prisma.category.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/categories");
  revalidatePath("/services");
  return { success: "Category created." };
}

export async function updateCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!id || !name || !slug) return { error: "Name and slug are required." };

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { error: "Another category already uses that slug." };
  }

  await prisma.category.update({ where: { id }, data: { name, slug } });

  revalidatePath("/admin/categories");
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/services");
}

// ---- Services ----

export async function createServiceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rate = Number(formData.get("rate") ?? 0);
  const min = Number(formData.get("min") ?? 100);
  const max = Number(formData.get("max") ?? 100000);

  if (!categoryId || !name || !rate) {
    return { error: "Category, name, and rate are required." };
  }

  await prisma.service.create({
    data: { categoryId, name, description, rate, min, max },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: "Service created." };
}

export async function updateServiceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rate = Number(formData.get("rate") ?? 0);
  const min = Number(formData.get("min") ?? 100);
  const max = Number(formData.get("max") ?? 100000);

  if (!id || !categoryId || !name || !rate) {
    return { error: "Category, name, and rate are required." };
  }

  await prisma.service.update({
    where: { id },
    data: { categoryId, name, description, rate, min, max },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}

export async function toggleServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return;
  await prisma.service.update({
    where: { id },
    data: { active: !service.active },
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

// ---- Orders ----

const ORDER_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "PARTIAL",
  "CANCELLED",
] as const;

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return;

  await prisma.order.update({
    where: { id },
    data: { status: status as (typeof ORDER_STATUSES)[number] },
  });
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");
}

// ---- Users ----

export async function adjustUserBalanceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  if (!id || !amount) return { error: "Amount is required." };

  await prisma.user.update({
    where: { id },
    data: { balance: { increment: amount } },
  });
  revalidatePath("/admin/users");
  return { success: "Balance updated." };
}

export async function toggleUserStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({
    where: { id },
    data: { status: user.status === "ACTIVE" ? "BANNED" : "ACTIVE" },
  });
  revalidatePath("/admin/users");
}

// ---- Fund requests ----

export async function reviewFundRequestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");

  const fundRequest = await prisma.fundRequest.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!fundRequest || fundRequest.status !== "PENDING") return;

  if (decision === "APPROVED") {
    await prisma.$transaction([
      prisma.fundRequest.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
      prisma.user.update({
        where: { id: fundRequest.userId },
        data: { balance: { increment: fundRequest.amount } },
      }),
    ]);
  } else {
    await prisma.fundRequest.update({
      where: { id },
      data: { status: "REJECTED" },
    });
  }

  await notify.notifyCustomerFundRequestReviewed({
    customerEmail: fundRequest.user.email,
    customerName: fundRequest.user.name,
    amount: fundRequest.amount,
    approved: decision === "APPROVED",
  });

  revalidatePath("/admin/funds");
  revalidatePath("/dashboard/funds");
}
