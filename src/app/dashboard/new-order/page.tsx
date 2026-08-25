import { prisma } from "@/lib/prisma";
import NewOrderForm from "./NewOrderForm";

export default async function NewOrderPage() {
  const categories = await prisma.category.findMany({
    include: { services: { where: { active: true }, orderBy: { name: "asc" } } },
    orderBy: { position: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-foreground">Place a New Order</h2>
      <p className="mt-1 text-sm text-slate-400">
        Select a service, enter your link and quantity, and submit your order.
      </p>
      <div className="mt-6 rounded-xl glass p-6">
        <NewOrderForm categories={categories} />
      </div>
    </div>
  );
}
