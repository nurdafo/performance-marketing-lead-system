"use client";

import { useEffect } from "react";

export const META_PIXEL_ID = "1676673266742125";

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: MetaPixelFunction;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

export type MetaLeadSource = "quiz" | "phone" | "whatsapp" | "telegram" | "instagram";

export function trackMetaLead(source: MetaLeadSource = "quiz") {
  window.fbq?.("track", "Lead", {
    content_category: "contact",
    content_name: source,
  });
}

export default function MetaPixel() {
  useEffect(() => {
    if (!window.fbq) {
      const fbq: MetaPixelFunction = (...args: unknown[]) => {
        if (fbq.callMethod) fbq.callMethod(...args);
        else (fbq.queue ??= []).push(args);
      };

      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq;
      window._fbq = fbq;
    }

    if (!document.querySelector('script[src="https://connect.facebook.net/en_US/fbevents.js"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }

    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }, []);

  return null;
}
