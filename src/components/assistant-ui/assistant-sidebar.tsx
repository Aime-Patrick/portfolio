"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { FC, PropsWithChildren } from "react";

import { Thread } from "@/components/assistant-ui/thread";

/**
 * Official assistant-ui co-pilot layout: app content | Thread.
 * @see https://www.assistant-ui.com/docs/ui/assistant-sidebar
 * Must sit under AssistantRuntimeProvider.
 */
export const AssistantSidebar: FC<
  PropsWithChildren<{
    emptyTitle?: string;
    emptyDescription?: string;
    placeholder?: string;
  }>
> = ({ children, emptyTitle, emptyDescription, placeholder }) => {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize="65" minSize="40">
        <div className="h-full min-h-0 overflow-hidden">{children}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="35" minSize="22">
        <div className="h-full min-h-0 border-l border-border bg-card">
          <Thread
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            placeholder={placeholder}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
