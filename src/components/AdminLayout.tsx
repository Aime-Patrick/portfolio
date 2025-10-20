import React from "react";
import AdminSidebar from "./AdminSidebar";
import { MdMenu } from "react-icons/md";
import { FaBell, FaSearch } from "react-icons/fa";

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
  <div className="h-screen flex bg-black relative overflow-hidden">
    {/* Animated Background Elements - Same as Login */}
    <div className="absolute inset-0 pointer-events-none">
      {/* Large Orange Orb */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/15 to-red-500/15 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Bottom Left Orb */}
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-tr from-orange-600/10 to-transparent rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 border-4 border-orange-500/25 rounded-lg rotate-45 animate-float"></div>
      <div className="absolute bottom-32 right-20 w-16 h-16 border-4 border-orange-400/15 rounded-full" style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-orange-500/8 to-red-500/8 rounded-xl rotate-12 animate-bounce-slow"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
    </div>
    
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden animate-fadeIn"
        onClick={() => setSidebarOpen(false)}
      ></div>
    )}
    {/* Main Content */}
    <div className="flex-1 h-screen flex flex-col lg:ml-0 overflow-hidden">
      {/* Topbar - Fixed */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-black/80 backdrop-blur-lg shadow-sm z-20 border-b border-orange-500/20 animate-slideDown flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-white transition-all duration-300 hover:scale-105"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <MdMenu className="text-2xl" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              {activeLabel}
            </h2>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-white transition-all duration-300 hover:scale-105">
            <FaSearch className="text-sm" />
            <span className="text-sm font-medium">Search</span>
          </button>
          <button className="relative p-2 md:p-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-white transition-all duration-300 hover:scale-105">
            <FaBell className="text-lg" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-orange-500/30">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--first-color)] to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
              AP
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content - Scrollable Area Only */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar animate-fadeIn">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  </div>
);

export default AdminLayout;