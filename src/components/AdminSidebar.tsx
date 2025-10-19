import React from "react";
import { 
  FaProjectDiagram, 
  FaUserCog, 
  FaSignOutAlt, 
  FaHome, 
  FaTools, 
  FaEnvelope, 
  FaCog,
  FaChartLine,
  FaAward
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

type AdminSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  active: string;
  setActive: (key: string) => void;
  handleLogout: () => void;
};

const navItems = [
  { label: "Dashboard", icon: <FaHome />, key: "dashboard", gradient: "from-blue-500 to-cyan-500" },
  { label: "Projects", icon: <FaProjectDiagram />, key: "projects", gradient: "from-purple-500 to-pink-500" },
  { label: "Services", icon: <FaTools />, key: "services", gradient: "from-green-500 to-emerald-500" },
  { label: "Certificates", icon: <FaAward />, key: "certificates", gradient: "from-yellow-500 to-amber-500" },
  { label: "About Me", icon: <FaUserCog />, key: "about", gradient: "from-teal-500 to-cyan-500" },
  { label: "Profile", icon: <FaUserCog />, key: "profile", gradient: "from-orange-500 to-red-500" },
  { label: "Messages", icon: <FaEnvelope />, key: "messages", gradient: "from-indigo-500 to-purple-500" },
  { label: "Settings", icon: <FaCog />, key: "settings", gradient: "from-gray-500 to-slate-500" },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  active, 
  setActive, 
  handleLogout 
}) => (
  <>
    {/* Sidebar */}
    <aside
      className={`fixed z-50 top-0 left-0 h-screen w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col transition-all duration-300 ease-out shadow-2xl shadow-black/50 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="relative px-6 py-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--first-color)] to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <HiSparkles className="text-xl text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <p className="text-xs text-gray-400">Manage your portfolio</p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <MdClose className="text-xl" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {navItems.map((item, index) => (
          <button
            key={item.key}
            className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 text-left overflow-hidden ${
              active === item.key
                ? "bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white shadow-lg shadow-orange-500/30"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
            }`}
            onClick={() => {
              setActive(item.key);
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            aria-label={item.label}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon Container */}
            <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${
              active === item.key
                ? "bg-white/20"
                : "bg-gray-800 group-hover:bg-gray-700"
            }`}>
              <span className={`text-lg ${
                active === item.key ? "text-white" : "text-gray-400 group-hover:text-white"
              }`}>
                {item.icon}
              </span>
            </div>

            {/* Label */}
            <span className="relative z-10 flex-1">{item.label}</span>

            {/* Active Indicator */}
            {active === item.key && (
              <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}

            {/* Gradient Hover Effect */}
            {active !== item.key && (
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            )}
          </button>
        ))}

        {/* Divider */}
        <div className="h-px bg-gray-700/50 my-3"></div>

        {/* Stats Card (Optional) */}
        <div className="mt-2 p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-green-400" />
            <span className="text-xs font-semibold text-gray-300">Portfolio Stats</span>
          </div>
          <div className="text-2xl font-bold text-white">All Good!</div>
          <div className="text-xs text-gray-400 mt-1">Everything is running smoothly</div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-[1.02]"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    {/* Overlay for mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  </>
);

export default AdminSidebar;