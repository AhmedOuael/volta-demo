"use client";

import { useEffect, useState } from "react";
import { LAST_ORDER_WHATSAPP_KEY } from "@/lib/demo";

/**
 * "Send my order on WhatsApp", using the link the checkout saved in this tab.
 * Shown only when that link is for the order in the URL, so an old or foreign
 * order number never reveals anything.
 */
export default function WhatsAppButton({ orderNumber }: { orderNumber: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LAST_ORDER_WHATSAPP_KEY);
      if (saved && decodeURIComponent(saved.split("?text=")[1] ?? "").includes(`#${orderNumber} `)) setUrl(saved);
    } catch {
      // Storage blocked or malformed link: no button.
    }
  }, [orderNumber]);

  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 bg-[#25d366] text-[#0b3d1f] px-8 py-4 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
    >
      Envoyer ma commande sur WhatsApp
    </a>
  );
}
