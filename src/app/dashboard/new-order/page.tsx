import { prisma } from "@/lib/prisma";
import NewOrderWorkspace from "./NewOrderWorkspace";

export default async function NewOrderPage() {
  const categories = await prisma.category.findMany({
    include: { services: { where: { active: true }, orderBy: { name: "asc" } } },
    orderBy: { position: "asc" },
  });

  const catalog = categories.map((c) => ({
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
        <NewOrderWorkspace categories={catalog} />
      </div>
    </div>
  );
}
