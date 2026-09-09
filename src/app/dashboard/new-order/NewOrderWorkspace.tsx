"use client";

import { useState } from "react";
import ServiceBrowser from "./ServiceBrowser";
import NewOrderForm from "./NewOrderForm";

export type CatalogService = {
  id: string;
  name: string;
  description: string;
  rate: number;
  min: number;
  max: number;
};

export type CatalogCategory = {
  id: string;
  name: string;
  services: CatalogService[];
};

export default function NewOrderWorkspace({ categories }: { categories: CatalogCategory[] }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(categories[0]?.services[0]?.id ?? "");

  function pick(nextCategoryId: string, nextServiceId: string) {
    setCategoryId(nextCategoryId);
    setServiceId(nextServiceId);
    // Bring the order form into view on small screens where it sits below the browser.
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (categories.length === 0) {
    return <p className="text-slate-400">No services are available yet. Please check back later.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <ServiceBrowser categories={categories} selectedServiceId={serviceId} onPick={pick} />
      <div id="order-form" className="scroll-mt-24 lg:sticky lg:top-6 lg:self-start">
        <div className="glass rounded-xl p-6">
          <h3 className="text-base font-semibold text-foreground">Order details</h3>
          <div className="mt-4">
            <NewOrderForm
              categories={categories}
              categoryId={categoryId}
              serviceId={serviceId}
              onChange={pick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
