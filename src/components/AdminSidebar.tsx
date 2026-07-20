"use client";

import type { FC } from "react";
import {
  LayoutDashboard,
  Layers3,
  Inbox,
  Settings,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  active: string;
  setActive: (key: string) => void;
  handleLogout: () => void;
  unreadCount?: number;
};

const generalItems = [
  { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { label: "Content", icon: Layers3, key: "content" },
  { label: "Messages", icon: Inbox, key: "messages" },
];

const supportItems = [{ label: "Settings", icon: Settings, key: "settings" }];

const AdminSidebar: FC<AdminSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  active,
  setActive,
  handleLogout,
  unreadCount = 0,
}) => {
  const renderItem = (item: (typeof generalItems)[number]) => {
    const Icon = item.icon;
    const isActive = active === item.key;
    return (
      <Button
        key={item.key}
        type="button"
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "h-8 w-full justify-start gap-2 px-2.5 text-sm font-medium",
          !isActive && "text-muted-foreground"
        )}
        onClick={() => {
          setActive(item.key);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
      >
        <Icon className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {item.key === "messages" && unreadCount > 0 ? (
          <Badge
            variant={isActive ? "secondary" : "default"}
            className="h-5 min-w-5 px-1.5 text-[10px]"
          >
            {unreadCount}
          </Badge>
        ) : null}
      </Button>
    );
  };

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-52 flex-col border-r border-border bg-card transition-transform duration-200 ease-out lg:static lg:h-auto lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Portfolio</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        <Separator />

        <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
          <div className="space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground">
              General
            </p>
            {generalItems.map(renderItem)}
          </div>
          <div className="space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground">
              Support
            </p>
            {supportItems.map(renderItem)}
          </div>
        </nav>

        <div className="border-t border-border p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="size-3.5" />
            Logout
          </Button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
    </>
  );
};

export default AdminSidebar;
