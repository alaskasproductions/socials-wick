import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditCategoryForm from "./EditCategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-foreground">Edit Category</h2>
      <div className="mt-4 glass rounded-xl p-6">
        <EditCategoryForm category={category} />
      </div>
    </div>
  );
}
