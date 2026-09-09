"use client";

import { useCallback, useState } from "react";
import type { PlatformSection } from "@/lib/packages";
import CheckoutModal, { type CheckoutRequest, type Viewer } from "./CheckoutModal";
import PlatformShowcase from "./PlatformShowcase";
import PriceCalculator from "./PriceCalculator";

export default function Storefront({
  sections,
  viewer,
}: {
  sections: PlatformSection[];
  viewer: Viewer;
}) {
  const [request, setRequest] = useState<CheckoutRequest | null>(null);
  const close = useCallback(() => setRequest(null), []);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <PlatformShowcase key={section.key} section={section} onBuy={setRequest} />
      ))}
      <PriceCalculator sections={sections} onPurchase={setRequest} />
      <CheckoutModal sections={sections} viewer={viewer} request={request} onClose={close} />
    </>
  );
}
