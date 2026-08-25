import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCategoryAction } from "@/lib/actions/admin";
import CreateCategoryForm from "./CreateCategoryForm";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { position: "asc" },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold text-foreground">Add Category</h2>
        <div className="mt-4 rounded-xl glass p-6">
          <CreateCategoryForm />
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-foreground">Categories</h2>
        <div className="mt-4 overflow-hidden rounded-xl glass">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Services</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-5 py-3 text-slate-400">{c.slug}</td>
                  <td className="px-5 py-3 text-slate-400">{c._count.services}</td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/categories/${c.id}/edit`}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteCategoryAction} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-xs font-semibold text-red-400 hover:underline">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-500">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
