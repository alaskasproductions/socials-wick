"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as provider from "@/lib/providers/morethanpanel";
import { syncPendingOrders } from "@/lib/order-sync";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
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

// Imports selected MoreThanPanel services into the local catalog, applying a
// markup percentage on top of the provider's cost rate. Categories are
// created automatically from the provider's category names when missing.
export async function importProviderServicesAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const markupPercent = Number(formData.get("markupPercent") ?? 30);
  const selected = formData.getAll("service") as string[];
  if (selected.length === 0) return { error: "Select at least one service to import." };

  let services: provider.ProviderService[];
  try {
    services = await provider.getServices();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to reach provider." };
  }

  const byId = new Map(services.map((s) => [String(s.service), s]));
  let imported = 0;

  for (const serviceId of selected) {
    const svc = byId.get(serviceId);
    if (!svc) continue;

    const slug = slugify(svc.category);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: svc.category, slug },
    });

    const providerRate = Number(svc.rate);
    const rate = Math.round(providerRate * (1 + markupPercent / 100) * 100) / 100;

    const existing = await prisma.service.findFirst({
      where: { providerServiceId: String(svc.service) },
    });

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: { providerRate, rate },
      });
    } else {
      await prisma.service.create({
        data: {
          categoryId: category.id,
          name: svc.name,
          rate,
          min: Number(svc.min) || 100,
          max: Number(svc.max) || 100000,
          providerServiceId: String(svc.service),
          providerRate,
        },
      });
    }
    imported++;
  }

  revalidatePath("/admin/services");
  revalidatePath("/admin/provider");
  revalidatePath("/services");
  return { success: `Imported/updated ${imported} service(s).` };
}

// Retries forwarding a locally-created order to the provider, e.g. after a
// transient failure left it without a providerOrderId.
export async function resendOrderToProviderAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const order = await prisma.order.findUnique({ where: { id }, include: { service: true } });
  if (!order || !order.service.providerServiceId) return;

  try {
    const result = await provider.addOrder({
      serviceId: order.service.providerServiceId,
      link: order.link,
      quantity: order.quantity,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { providerOrderId: String(result.order), providerError: null },
    });
  } catch (err) {
    await prisma.order.update({
      where: { id: order.id },
      data: { providerError: err instanceof Error ? err.message : "Unknown provider error" },
    });
  }

  revalidatePath("/admin/orders");
}

// Manual "Sync Now" trigger from the admin UI. Orders also sync
// automatically in the background — see /lib/order-sync.ts.
export async function syncOrderStatusesAction(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const result = await syncPendingOrders();

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");

  if (result.error) return { error: result.error };
  if (result.total === 0) return { success: "No orders needed syncing." };
  return { success: `Synced ${result.synced} of ${result.total} order(s).` };
}
