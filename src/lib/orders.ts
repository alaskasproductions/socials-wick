import { prisma } from "@/lib/prisma";
import * as provider from "@/lib/providers/morethanpanel";
import * as notify from "@/lib/notifications";
import { displayName } from "@/lib/catalog";

export class OrderError extends Error {}

export type PlacedOrder = { orderId: string; charge: number; serviceName: string };

export function orderCharge(rate: number, quantity: number): number {
  return Math.round((quantity / 1000) * rate * 100) / 100;
}

/**
 * Places an order for a user: validates the service and quantity, debits the
 * balance, creates the Order row, forwards it to the fulfilment provider and
 * sends the notifications. Shared by the dashboard form and the paid checkout.
 */
export async function placeOrder(params: {
  userId: string;
  serviceId: string;
  quantity: number;
  link: string;
}): Promise<PlacedOrder> {
  const { userId, serviceId, quantity, link } = params;
  if (!serviceId || !link || !quantity) throw new OrderError("All fields are required.");

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) throw new OrderError("Service not found.");
  if (quantity < service.min || quantity > service.max) {
    throw new OrderError(`Quantity must be between ${service.min} and ${service.max}.`);
  }

  const charge = orderCharge(service.rate, quantity);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new OrderError("User not found.");
  if (user.balance < charge) throw new OrderError("Insufficient balance. Please add funds first.");

  const [, order] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { balance: { decrement: charge } } }),
    prisma.order.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        link,
        quantity,
        charge,
        remains: quantity,
        status: "PENDING",
      },
    }),
  ]);

  // Forward to the provider if this service is sourced from them. Failures
  // don't block the order — the customer has already paid, so an admin can
  // retry delivery from /admin/orders.
  if (service.providerServiceId) {
    try {
      const result = await provider.addOrder({ serviceId: service.providerServiceId, link, quantity });
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
  }

  await Promise.all([
    notify.notifyAdminNewOrder({
      customerName: user.name,
      customerEmail: user.email,
      serviceName: service.name,
      quantity,
      charge,
      link,
    }),
    notify.notifyCustomerOrderConfirmation({
      customerEmail: user.email,
      customerName: user.name,
      serviceName: displayName(service.name),
      quantity,
      charge,
    }),
  ]);

  return { orderId: order.id, charge, serviceName: service.name };
}
