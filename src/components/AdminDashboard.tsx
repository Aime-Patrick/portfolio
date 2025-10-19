import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import AdminLayout from "./AdminLayout";
import DashboardHome from "./admin/DashboardHome";
import ProjectsManager from "./admin/ProjectsManager";
import ServicesManager from "./admin/ServicesManager";
import ProfileManager from "./admin/ProfileManager";
import MessagesManager from "./admin/MessagesManager";
import SiteSettingsManager from "./admin/SiteSettingsManager";
import CertificatesManager from "./admin/CertificatesManager";
import AboutManager from "./admin/AboutManager";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

export function isAdminAuthenticated(): boolean {
  return !!auth.currentUser;
}

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("dashboard");
  const location = useLocation();
  const navigate = useNavigate();

  // Handle URL query parameters for direct section access
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section && ["dashboard", "projects", "services", "certificates", "about", "profile", "messages", "settings"].includes(section)) {
      setActive(section);
    }
  }, [location]);

  // Update URL when active section changes
  useEffect(() => {
    navigate(`/admin?section=${active}`, { replace: true });
  }, [active, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Map active key to label for AdminLayout
  const navLabels: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    services: "Services",
    certificates: "Certificates",
    about: "About Me",
    profile: "Profile",
    messages: "Messages",
    settings: "Site Settings",
  };

  // Render the appropriate component based on active section
  const renderActiveComponent = () => {
    switch (active) {
      case "projects":
        return <ProjectsManager />;
      case "services":
        return <ServicesManager />;
      case "certificates":
        return <CertificatesManager />;
      case "about":
        return <AboutManager />;
      case "profile":
        return <ProfileManager />;
      case "messages":
        return <MessagesManager />;
      case "settings":
        return <SiteSettingsManager />;
      case "dashboard":
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--body-color)]">
      <Toaster position="top-right" />
      <AdminLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active={active}
        setActive={setActive}
        handleLogout={handleLogout}
        activeLabel={navLabels[active] || "Dashboard"}
      >
        {renderActiveComponent()}
      </AdminLayout>
    </div>
  );
};

export default AdminDashboard;