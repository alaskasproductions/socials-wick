import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as viva from "@/lib/providers/viva";
import * as stripe from "@/lib/providers/stripe";
import NewOrderWorkspace from "./NewOrderWorkspace";

export default async function NewOrderPage() {
  const session = await auth();
  const [categories, user, vivaEnabled, stripeEnabled] = await Promise.all([
    prisma.category.findMany({
      include: { services: { where: { active: true }, orderBy: { name: "asc" } } },
      orderBy: { position: "asc" },
    }),
    prisma.user.findUnique({ where: { id: session!.user.id }, select: { balance: true } }),
    viva.isEnabled(),
    stripe.isEnabled(),
  ]);

  // Categories without an active service would be dead entries in the form's dropdown.
  const catalog = categories.filter((c) => c.services.length > 0).map((c) => ({
    id: c.id,
    name: c.name,
    services: c.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      rate: s.rate,
      min: s.min,
      max: s.max,
    })),
  }));

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Place a New Order</h2>
      <p className="mt-1 text-sm text-slate-400">
        Browse the catalog, pick a service, then enter your link and quantity on the right.
      </p>
      <div className="mt-6">
        <NewOrderWorkspace
          categories={catalog}
          balance={user?.balance ?? 0}
          cardGateway={vivaEnabled ? "viva" : stripeEnabled ? "stripe" : null}
        />
      </div>
    </div>
  );
}
