"use client";

import { Toaster } from "@/components/ui/sonner";
import SiteSettingsProvider from "@/components/SiteSettingsProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <TooltipProvider>
        <Toaster />
        {children}
      </TooltipProvider>
    </SiteSettingsProvider>
  );
}
