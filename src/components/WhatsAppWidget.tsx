"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { aixcoLiveIcons } from "@/lib/aixco-live-assets";
import {
  getWhatsAppContactForCountry,
  type MarketWhatsAppContact,
} from "@/lib/market-whatsapp";

function readCountry(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("country" in payload)) return null;
  const country = (payload as { country?: unknown }).country;
  return typeof country === "string" ? country : null;
}

export function WhatsAppWidget() {
  const [contact, setContact] = useState<MarketWhatsAppContact | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/location/country", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (!controller.signal.aborted) {
          setContact(getWhatsAppContactForCountry(readCountry(payload)));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setContact(null);
      });

    return () => controller.abort();
  }, []);

  if (!contact) return null;

  return (
    <div
      data-whatsapp-floating-container="true"
      className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] end-[max(1.25rem,env(safe-area-inset-right,0px))] z-[95] flex max-w-[calc(100vw-2.5rem)] items-end justify-end md:bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:end-[max(1.5rem,env(safe-area-inset-right,0px))]"
    >
      <a
        data-market-whatsapp-link="true"
        href={contact.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        title="WhatsApp"
        className="group pointer-events-auto relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-[#6A5417]/30 bg-white text-[#6A5417] shadow-gold transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-[#E6C767] hover:bg-[#6A5417]/[0.06] hover:shadow-[0_12px_30px_-18px_hsl(var(--primary)/0.8)] focus-visible:border-[#E6C767] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A5417]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-14 md:w-14"
      >
        <Image
          src={aixcoLiveIcons.whatsapp}
          alt=""
          aria-hidden="true"
          width={34}
          height={34}
          unoptimized
          className="h-8 w-8 object-contain opacity-100 transition-opacity duration-200 ease-out group-hover:opacity-0 group-focus-visible:opacity-0 md:h-9 md:w-9"
        />
        <Image
          src={aixcoLiveIcons.whatsappYellow}
          alt=""
          aria-hidden="true"
          width={34}
          height={34}
          unoptimized
          className="pointer-events-none absolute h-8 w-8 object-contain opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 md:h-9 md:w-9"
        />
        <span className="sr-only">WhatsApp</span>
      </a>
    </div>
  );
}
