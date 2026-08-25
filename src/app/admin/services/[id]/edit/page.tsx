import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditServiceForm from "./EditServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!service) notFound();

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-foreground">Edit Service</h2>
      <div className="mt-4 glass rounded-xl p-6">
        <EditServiceForm service={service} categories={categories} />
      </div>
    </div>
  );
}
