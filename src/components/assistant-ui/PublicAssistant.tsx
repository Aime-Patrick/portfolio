"use client";

import { useMemo } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

function PublicAssistantInner({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        body: { scope: "public" },
      }),
    []
  );

  const runtime = useChatRuntime({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  // defaultOpen is reserved for deep-links; AssistantModal manages its own open state
  void defaultOpen;

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModal
        emptyTitle="Ask about this portfolio"
        emptyDescription="Projects, skills, services, or how to hire Patrick."
        placeholder="Ask about projects or skills…"
      />
    </AssistantRuntimeProvider>
  );
}

export default function PublicAssistant({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  const { settings } = useSiteSettings();
  if (settings.enableChatbot === false) return null;
  return <PublicAssistantInner defaultOpen={defaultOpen} />;
}
