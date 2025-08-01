import React from "react";
import AdminSidebar from "./AdminSidebar";
import { MdMenu } from "react-icons/md";

type AdminLayoutProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  active: string;
  setActive: (key: string) => void;
  handleLogout: () => void;
  activeLabel: string;
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ sidebarOpen, setSidebarOpen, active, setActive, handleLogout, activeLabel, children }) => (
  <div className="!min-h-screen flex !bg-[var(--body-color)]">
    {/* Sidebar */}
    <AdminSidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      active={active}
      setActive={setActive}
      handleLogout={handleLogout}
    />
    {/* Overlay for mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 !bg-black/40 z-30 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      ></div>
    )}
    {/* Main Content */}
    <div className="flex-1 !min-h-screen flex flex-col lg:ml-64">
      {/* Topbar */}
      <header className="flex items-center justify-between !px-6 !py-4 !bg-white !shadow-md sticky top-0 z-20">
        <button
          className="lg:hidden !text-3xl !text-[var(--color-black)]"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <MdMenu />
        </button>
        <h2 className="!text-2xl !font-bold !text-[var(--color-black)]">{activeLabel}</h2>
        <div></div>
      </header>
      <main className="flex-1 !p-8 flex flex-col gap-8 !overflow-y-auto">
        {children}
      </main>
    </div>
  </div>
);

export default AdminLayout;