import React from "react";
import { FaProjectDiagram, FaUserCog, FaSignOutAlt, FaHome, FaTools, FaEnvelope, FaCog } from "react-icons/fa";
import { MdClose } from "react-icons/md";

type AdminSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  active: string;
  setActive: (key: string) => void;
  handleLogout: () => void;
};

const navItems = [
  { label: "Dashboard", icon: <FaHome />, key: "dashboard" },
  { label: "Projects", icon: <FaProjectDiagram />, key: "projects" },
  { label: "Services", icon: <FaTools />, key: "services" },
  { label: "Profile", icon: <FaUserCog />, key: "profile" },
  { label: "Messages", icon: <FaEnvelope />, key: "messages" },
  { label: "Settings", icon: <FaCog />, key: "settings" },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ sidebarOpen, setSidebarOpen, active, setActive, handleLogout }) => (
  <aside
    className={`fixed z-40 top-0 left-0  !w-64 !bg-[var(--color-black)] !text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
  >
    <div className="flex items-center justify-between !px-6 !py-6 !border-b !border-[var(--black-color-light)]">
      <span className="!text-2xl !font-bold !tracking-wide">Admin</span>
      <button
        className="lg:hidden !text-2xl"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        <MdClose />
      </button>
    </div>
    <nav className="flex-1 flex flex-col gap-2 !mt-6 !px-2">
      {navItems.map((item) => (
        <button
          key={item.key}
          className={`flex items-center gap-3 !px-4 !py-3 !rounded-lg !font-semibold !text-lg transition !text-left ${active === item.key ? "!bg-[var(--first-color)] !text-white" : "hover:!bg-[var(--black-color-light)]"}`}
          onClick={() => setActive(item.key)}
          aria-label={item.label}
        >
          <span className="!text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
    <button
      className="flex items-center gap-3 !px-4 !py-3 !m-4 !rounded-lg !font-semibold !text-lg !bg-[var(--first-color)] hover:!bg-[var(--black-color-light)] transition"
      onClick={handleLogout}
      aria-label="Logout"
    >
      <FaSignOutAlt className="!text-xl" />
      <span>Logout</span>
    </button>
  </aside>
);

export default AdminSidebar;