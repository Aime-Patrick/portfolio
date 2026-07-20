"use client";

import { useState, useEffect } from "react";
import { Menu, Search, Bell, PanelRightOpen, PanelRightClose } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminAssistant, {
  AdminAssistantProvider,
  ADMIN_EMPTY,
} from "./assistant-ui/AdminAssistant";
import { AssistantSidebar } from "./assistant-ui/assistant-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import ErrorBoundary from "./ErrorBoundary";

function useIsXl() {
  const [isXl, setIsXl] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsXl(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isXl;
}

type AdminLayoutProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  active: string;
  setActive: (key: string) => void;
  handleLogout: () => void;
  activeLabel: string;
  unreadCount?: number;
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
  sidebarOpen,
  setSidebarOpen,
  active,
  setActive,
  handleLogout,
  activeLabel,
  unreadCount = 0,
  children,
}) => {
  const isXl = useIsXl();
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Public site uses dark body !important. Toggle html.admin-active so the
  // light admin shell isn't sitting on a black page (visible as a bottom strip).
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("admin-active");
    html.classList.remove("dark");
    return () => {
      html.classList.remove("admin-active");
      html.classList.add("dark");
    };
  }, []);

  const mainContent = (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background">
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2.5 md:px-4">
        <Button
          size="icon"
          variant="ghost"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="size-4" />
        </Button>

        <div className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            className="h-8 bg-background pl-8 text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="relative"
            onClick={() => setActive("messages")}
            aria-label="Messages"
          >
            <Bell className="size-4" />
            {unreadCount > 0 ? (
              <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px]">
                {unreadCount}
              </Badge>
            ) : null}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setAssistantOpen((v) => !v)}
            aria-label={assistantOpen ? "Hide assistant" : "Show assistant"}
          >
            {assistantOpen ? (
              <PanelRightClose className="size-4" />
            ) : (
              <PanelRightOpen className="size-4" />
            )}
          </Button>
          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                AP
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-medium">Aime Patrick</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full space-y-4 px-3 py-4 sm:px-4 lg:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <h1 className="font-semibold tracking-tight">{activeLabel}</h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );

  return (
    <AdminAssistantProvider>
      <div className="admin-shell fixed inset-0 z-10 flex overflow-hidden bg-background text-foreground">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          active={active}
          setActive={setActive}
          handleLogout={handleLogout}
          unreadCount={unreadCount}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {assistantOpen && isXl ? (
            <ErrorBoundary fallback={mainContent}>
              <AssistantSidebar {...ADMIN_EMPTY}>{mainContent}</AssistantSidebar>
            </ErrorBoundary>
          ) : (
            mainContent
          )}
        </div>

        <Sheet open={assistantOpen && !isXl} onOpenChange={setAssistantOpen}>
          <SheetContent side="right" className="admin-shell w-full p-0 sm:max-w-md">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Copilot</SheetTitle>
            </SheetHeader>
            <div className="h-full">
              <ErrorBoundary fallback={null}>
                <AdminAssistant />
              </ErrorBoundary>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AdminAssistantProvider>
  );
};

export default AdminLayout;
