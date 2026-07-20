"use client";

import { useMemo, type ReactNode } from "react";
import { AssistantRuntimeProvider, useAuiState } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { auth } from "@/firebase";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { DotMatrix } from "@/components/assistant-ui/dot-matrix";

const ADMIN_EMPTY = {
  emptyTitle: "What should we tackle?",
  emptyDescription:
    "Try “rate our SEO”, “summarize unread messages”, or “how many projects?”",
  placeholder: "Ask the admin copilot…",
} as const;

/** Shared runtime for desktop AssistantSidebar + mobile Sheet. */
export function AdminAssistantProvider({ children }: { children: ReactNode }) {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        body: { scope: "admin" },
        headers: async (): Promise<Record<string, string>> => {
          const token = await auth.currentUser?.getIdToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    []
  );

  const runtime = useChatRuntime({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
  );
}

function AdminCopilotHeader() {
  const isRunning = useAuiState((s) => s.thread.isRunning);
  return (
    <div className="shrink-0 border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <DotMatrix
          state={isRunning ? "thinking" : "idle"}
          className="size-4"
          label={isRunning ? "Generating" : "Ready"}
        />
        <p className="text-sm font-semibold">Admin Copilot</p>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Inbox, stats, SEO audit, content — ask clearly; I won’t invent tools
      </p>
    </div>
  );
}

/** Compact panel for Sheet / narrow viewports (thread list + chat). */
export default function AdminAssistant() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <AdminCopilotHeader />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-36 shrink-0 flex-col border-r border-border bg-muted/20">
          <p className="px-2.5 pt-2 text-xs font-medium text-muted-foreground">
            Chats
          </p>
          <ThreadList className="min-h-0 flex-1" />
        </div>
        <div className="min-h-0 min-w-0 flex-1">
          <Thread {...ADMIN_EMPTY} />
        </div>
      </div>
    </div>
  );
}

export { ADMIN_EMPTY };
