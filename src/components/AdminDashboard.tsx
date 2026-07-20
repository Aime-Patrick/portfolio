"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase";
import AdminLayout from "./AdminLayout";
import DashboardHome from "./admin/DashboardHome";
import MessagesManager from "./admin/MessagesManager";
import SiteSettingsManager from "./admin/SiteSettingsManager";
import ContentHub from "./admin/ContentHub";

const P0_SECTIONS = ["dashboard", "content", "messages", "settings"] as const;
type Section = (typeof P0_SECTIONS)[number];

function isSection(value: string | null): value is Section {
  return !!value && (P0_SECTIONS as readonly string[]).includes(value);
}

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState<Section>("dashboard");
  const [unreadCount, setUnreadCount] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const section = searchParams.get("section");
    if (isSection(section)) setActive(section);
    if (
      section &&
      ["home", "projects", "services", "certificates", "about", "profile"].includes(
        section
      )
    ) {
      setActive("content");
    }
  }, [searchParams]);

  useEffect(() => {
    router.replace(`/admin?section=${active}`);
  }, [active, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "messages"));
        if (cancelled) return;
        setUnreadCount(snap.docs.filter((d) => d.data().read !== true).length);
      } catch {
        /* offline / missing env — ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navLabels: Record<Section, string> = {
    dashboard: "Dashboard",
    content: "Content",
    messages: "Messages",
    settings: "Settings",
  };

  const renderActiveComponent = () => {
    switch (active) {
      case "content":
        return <ContentHub />;
      case "messages":
        return <MessagesManager />;
      case "settings":
        return <SiteSettingsManager />;
      case "dashboard":
      default:
        return (
          <DashboardHome
            onNavigate={(section) => {
              if (isSection(section)) setActive(section);
            }}
          />
        );
    }
  };

  return (
    <AdminLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      active={active}
      setActive={(key) => {
        if (isSection(key)) setActive(key);
      }}
      handleLogout={handleLogout}
      activeLabel={navLabels[active]}
      unreadCount={unreadCount}
    >
      {renderActiveComponent()}
    </AdminLayout>
  );
};

export default AdminDashboard;
