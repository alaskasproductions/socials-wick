import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleServiceAction, deleteServiceAction } from "@/lib/actions/admin";
import CreateServiceForm from "./CreateServiceForm";

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold text-foreground">Add Service</h2>
        <div className="mt-4 rounded-xl glass p-6">
          <CreateServiceForm categories={categories} />
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-foreground">Services</h2>
        <div className="mt-4 overflow-x-auto rounded-xl glass">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Rate</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="px-5 py-3 text-slate-400">{s.category.name}</td>
                  <td className="px-5 py-3 text-slate-400">€{s.rate.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        s.active ? "bg-green-500/15 text-green-400" : "bg-white/8 text-slate-400"
                      }`}
                    >
                      {s.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/services/${s.id}/edit`}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={toggleServiceAction} className="inline">
                      <input type="hidden" name="id" value={s.id} />
                      <button className="text-xs font-semibold text-brand hover:underline">
                        {s.active ? "Disable" : "Enable"}
                      </button>
                    </form>
                    <form action={deleteServiceAction} className="inline">
                      <input type="hidden" name="id" value={s.id} />
                      <button className="text-xs font-semibold text-red-400 hover:underline">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-500">
                    No services yet.
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
