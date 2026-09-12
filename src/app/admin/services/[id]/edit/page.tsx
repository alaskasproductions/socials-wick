import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditServiceForm from "./EditServiceForm";
import ServiceGuidePanel from "@/components/ServiceGuidePanel";
import { buildServiceGuide, guideToText } from "@/lib/service-guide";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!service) notFound();

  const guide = buildServiceGuide({
    name: service.name,
    categoryName: service.category.name,
    min: service.min,
    max: service.max,
  });

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold text-foreground">Edit Service</h2>
        <div className="mt-4 glass rounded-xl p-6">
          <EditServiceForm service={service} categories={categories} />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">What customers see</h2>
        <p className="mt-1 text-xs text-slate-400">
          Generated from the service name. Leave the Description field empty to use it, or paste this
          text and edit it to override.
        </p>
        <div className="mt-4">
          <ServiceGuidePanel guide={guide} adminText={service.description || undefined} />
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-brand hover:underline">
            Copy the generated text
          </summary>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-[11px] text-slate-300">
            {guideToText(guide)}
          </pre>
        </details>
      </div>
    </div>
  );
}
