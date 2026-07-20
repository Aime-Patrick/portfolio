"use client";

import type { FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ThreadList: FC<{ className?: string }> = ({ className }) => {
  return (
    <ThreadListPrimitive.Root
      className={cn("flex flex-col gap-1 p-2", className)}
    >
      <ThreadListPrimitive.New asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full justify-start gap-2 px-2.5 text-sm font-normal"
        >
          <PlusIcon className="size-4 shrink-0" />
          New chat
        </Button>
      </ThreadListPrimitive.New>

      <div className="mt-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        <ThreadListPrimitive.Items>
          {({ threadListItem }) => (
            <ThreadListItem key={threadListItem.id} />
          )}
        </ThreadListPrimitive.Items>
      </div>
    </ThreadListPrimitive.Root>
  );
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="group data-[active]:bg-muted hover:bg-muted relative flex items-center rounded-md transition-colors">
      <ThreadListItemPrimitive.Trigger className="flex h-8 min-w-0 flex-1 items-center px-2.5 text-start text-sm">
        <span className="truncate">
          <ThreadListItemPrimitive.Title fallback="New chat" />
        </span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Archive asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 opacity-0 transition-opacity group-hover:opacity-100 data-[active]:opacity-100"
          aria-label="Archive thread"
        >
          <ArchiveIcon className="size-3.5" />
        </Button>
      </ThreadListItemPrimitive.Archive>
    </ThreadListItemPrimitive.Root>
  );
};
