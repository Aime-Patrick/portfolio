"use client";

import { lazy, Suspense, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

const PublicAssistant = lazy(
  () => import("@/components/assistant-ui/PublicAssistant")
);

/**
 * Lightweight FAB until the user opens chat — keeps the ~2MB assistant chunk
 * off the critical path (and out of Lighthouse cold loads).
 */
export default function AssistantGate() {
  const { settings, loading } = useSiteSettings();
  const [shouldLoad, setShouldLoad] = useState(false);

  const enabled = settings.enableChatbot !== false;
  if (!loading && !enabled) return null;

  if (!shouldLoad) {
    return (
      <button
        type="button"
        className="fixed z-[200] grid size-12 place-items-center rounded-full bg-[hsl(18,100%,48%)] text-white shadow-lg shadow-black/40 transition hover:scale-105 hover:bg-[hsl(18,90%,42%)] sm:size-14 bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] md:bottom-6 md:right-6"
        onClick={() => setShouldLoad(true)}
        aria-label="Open portfolio assistant"
      >
        <MessageCircle className="size-5" />
      </button>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          className="fixed z-[200] size-12 rounded-full bg-[hsl(18,100%,48%)] opacity-80 sm:size-14 bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] md:bottom-6 md:right-6"
          aria-hidden
        />
      }
    >
      <PublicAssistant defaultOpen />
    </Suspense>
  );
}
