"use client";

import { useState, type ReactNode } from "react";
import {
  Home,
  FolderKanban,
  Wrench,
  Award,
  UserRound,
  IdCard,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import HomeManager from "./HomeManager";
import ProjectsManager from "./ProjectsManager";
import ServicesManager from "./ServicesManager";
import CertificatesManager from "./CertificatesManager";
import AboutManager from "./AboutManager";
import ProfileManager from "./ProfileManager";

type ContentKey =
  | "home"
  | "projects"
  | "services"
  | "certificates"
  | "about"
  | "profile";

const items: {
  key: ContentKey;
  title: string;
  description: string;
  icon: typeof Home;
}[] = [
  {
    key: "home",
    title: "Home",
    description: "Hero copy, type animation, portrait",
    icon: Home,
  },
  {
    key: "projects",
    title: "Projects",
    description: "Case studies and live links",
    icon: FolderKanban,
  },
  {
    key: "services",
    title: "Services",
    description: "What you offer clients",
    icon: Wrench,
  },
  {
    key: "certificates",
    title: "Certificates",
    description: "Awards and credentials",
    icon: Award,
  },
  {
    key: "about",
    title: "About",
    description: "Bio, experience, skills",
    icon: UserRound,
  },
  {
    key: "profile",
    title: "Profile",
    description: "Identity, resume import, socials",
    icon: IdCard,
  },
];

const managers: Record<ContentKey, ReactNode> = {
  home: <HomeManager />,
  projects: <ProjectsManager />,
  services: <ServicesManager />,
  certificates: <CertificatesManager />,
  about: <AboutManager />,
  profile: <ProfileManager />,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function ContentHub() {
  const [openKey, setOpenKey] = useState<ContentKey | null>(null);
  const active = items.find((i) => i.key === openKey);

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.key}
              type="button"
              variants={itemAnim}
              onClick={() => setOpenKey(item.key)}
              className="text-left"
            >
              <Card className="h-full border-border transition-all hover:border-primary/40 hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-primary">
                    Open editor →
                  </span>
                </CardContent>
              </Card>
            </motion.button>
          );
        })}
      </motion.div>

      <Sheet open={!!openKey} onOpenChange={(open) => !open && setOpenKey(null)}>
        <SheetContent
          side="right"
          className="admin-shell w-full p-0 sm:max-w-2xl lg:max-w-3xl"
        >
          <SheetHeader className="border-b border-border px-6 py-4 text-left">
            <SheetTitle>{active?.title || "Content"}</SheetTitle>
            <SheetDescription>
              {active?.description || "Edit portfolio content"}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100svh-5.5rem)] px-6 py-4">
            {openKey ? managers[openKey] : null}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
