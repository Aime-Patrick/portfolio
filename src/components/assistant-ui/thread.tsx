"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DotMatrix } from "@/components/assistant-ui/dot-matrix";

export function Thread({
  className,
  placeholder = "Ask anything…",
  emptyTitle = "How can I help?",
  emptyDescription = "Ask about projects, skills, or how to get in touch.",
}: {
  className?: string;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <ThreadPrimitive.Root
      className={cn(
        "aui-root flex h-full min-h-0 flex-col bg-background text-foreground",
        className
      )}
    >
      <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <ThreadPrimitive.Empty>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <DotMatrix state="idle" className="size-6" label="Ready" />
            </div>
            <div>
              <p className="text-base font-semibold">{emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
            </div>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <div className="border-t border-border bg-card/80 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-3">
        <ThreadRunStatus />
        <ComposerPrimitive.Root className="flex items-end gap-2 rounded-2xl border border-border bg-background px-2.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring/40 sm:px-3 sm:py-2">
          <ComposerPrimitive.Input
            placeholder={placeholder}
            rows={1}
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground sm:max-h-32"
          />
          <ComposerSendButton />
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}

function ThreadRunStatus() {
  const isRunning = useAuiState((s) => s.thread.isRunning);
  if (!isRunning) return null;

  return (
    <div className="mb-2 flex items-center gap-2 px-1 text-sm text-muted-foreground">
      <DotMatrix state="thinking" className="size-4" />
      <span>Generating response…</span>
    </div>
  );
}

function ComposerSendButton() {
  const isRunning = useAuiState((s) => s.thread.isRunning);

  if (isRunning) {
    return (
      <ComposerPrimitive.Cancel asChild>
        <Button size="icon" variant="secondary" className="shrink-0 rounded-full">
          <Square className="size-3.5 fill-current" />
        </Button>
      </ComposerPrimitive.Cancel>
    );
  }

  return (
    <ComposerPrimitive.Send asChild>
      <Button size="icon" className="shrink-0 rounded-full">
        <ArrowUp className="size-4" />
      </Button>
    </ComposerPrimitive.Send>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-2.5 text-sm text-card-foreground shadow-sm">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
}

function MarkdownText() {
  return (
    <MarkdownTextPrimitive className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0" />
  );
}
