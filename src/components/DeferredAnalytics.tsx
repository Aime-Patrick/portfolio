"use client";

import { useEffect } from "react";

const GA_ID = "G-QDKVR8QDSF";

/**
 * Load gtag after the page is interactive so analytics never competes with LCP/TBT.
 */
export default function DeferredAnalytics() {
  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const inject = () => {
      if (cancelled || document.getElementById("ga-gtag")) return;

      window.dataLayer = window.dataLayer || [];
      window.gtag =
        window.gtag ||
        function gtag(...args: unknown[]) {
          window.dataLayer.push(args);
        };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID);

      const script = document.createElement("script");
      script.id = "ga-gtag";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.body.appendChild(script);
    };

    const schedule = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => inject(), { timeout: 4000 });
      } else {
        timeoutId = setTimeout(inject, 2500);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
