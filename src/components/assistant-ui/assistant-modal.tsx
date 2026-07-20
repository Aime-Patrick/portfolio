"use client";

import { AssistantModalPrimitive, useAuiState } from "@assistant-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { Thread } from "@/components/assistant-ui/thread";
import { DotMatrix } from "@/components/assistant-ui/dot-matrix";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ModalTriggerIcon() {
  const isRunning = useAuiState((s) => s.thread.isRunning);
  return (
    <>
      <DotMatrix
        state={isRunning ? "streaming" : "idle"}
        className="size-5 text-white [[data-state=open]_&]:hidden"
        label={isRunning ? "Generating" : "Assistant"}
      />
      <ChevronDownIcon className="size-5 [[data-state=closed]_&]:hidden" />
    </>
  );
}

/**
 * Floating chat modal from assistant-ui primitives.
 * Must be under AssistantRuntimeProvider.
 */
export function AssistantModal({
  emptyTitle,
  emptyDescription,
  placeholder,
}: {
  emptyTitle?: string;
  emptyDescription?: string;
  placeholder?: string;
}) {
  return (
    <AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Anchor className="fixed right-4 bottom-4 z-[200] md:right-6 md:bottom-6">
        <AssistantModalPrimitive.Trigger asChild>
          <Button
            size="icon"
            className={cn(
              "size-12 rounded-full bg-[hsl(18,100%,48%)] text-white shadow-lg shadow-black/40 hover:bg-[hsl(18,90%,42%)] sm:size-14",
              "data-[state=open]:bg-secondary data-[state=open]:text-secondary-foreground"
            )}
            aria-label="Toggle portfolio assistant"
          >
            <ModalTriggerIcon />
          </Button>
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="z-[200] h-[min(560px,70vh)] w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl outline-none"
      >
        <Thread
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          placeholder={placeholder}
        />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
}
