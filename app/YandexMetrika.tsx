"use client";

import { useEffect } from "react";

const YANDEX_METRIKA_ID = 111247879;

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & {
      a?: unknown[][];
      l?: number;
    };
  }
}

export default function YandexMetrika() {
  useEffect(() => {
    if (!window.ym) {
      const ym = ((...args: unknown[]) => {
        (ym.a ??= []).push(args);
      }) as NonNullable<Window["ym"]>;

      ym.l = Date.now();
      window.ym = ym;
    }

    const scriptUrl = `https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}`;

    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = scriptUrl;
      document.head.appendChild(script);
    }

    window.ym(YANDEX_METRIKA_ID, "init", {
      ssr: true,
      webvisor: true,
      clickmap: true,
      accurateTrackBounce: true,
      trackLinks: true,
    });
  }, []);

  return null;
}
