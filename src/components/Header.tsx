import React, { useState, useEffect } from "react";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useSiteSettings } from "./SiteSettingsProvider";

const Header: React.FC = () => {
  const { settings } = useSiteSettings();
  const [showMenu, setShowMenu] = useState(false);
  const [shadow, setShadow] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Handle scroll shadow and active section
  useEffect(() => {
    const handleScroll = () => {
      setShadow(window.scrollY >= 50);
      
      // Update active section based on scroll position
      const sections = ["home", "about", "services", "project", "contact"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on nav link click (mobile)
  const handleNavLinkClick = (section: string) => {
    setShowMenu(false);
    setActiveSection(section);
  };

  return (
    <>
      <header 
        className={`header transition-all duration-300 ${
          shadow ? "shadow-lg shadow-black/20 border-b border-gray-800/50 bg-black/50 backdrop-blur-sm" : ""
        }`} 
        id="header"
      >
        <nav className="flex items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <a 
            href="/" 
            className="flex items-center gap-2 group transition-all duration-300 hover:scale-105"
          >
            <span className="px-4 py-2 rounded-full bg-gradient-to-br text-white from-[var(--first-color)] to-orange-600 shadow-lg shadow-orange-500/30 transition-transform group-hover:rotate-12">
              P
            </span>
            <span className="nav__logo_name bg-gradient-to-r from-[var(--first-color)] to-orange-600 bg-clip-text text-transparent font-bold">
              {settings.siteTitle || "CodeWithPatrick."}
            </span>
          </a>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { href: "#home", label: "Home", id: "home" },
              { href: "#about", label: "About", id: "about" },
              { href: "#services", label: "Services", id: "services" },
              { href: "#project", label: "Projects", id: "project" },
            ].map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={() => handleNavLinkClick(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative group ${
                    activeSection === item.id
                      ? "text-[var(--first-color)] bg-orange-900/20"
                      : "text-[var(--text-color)] hover:text-[var(--first-color)] hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[var(--first-color)] to-orange-600 rounded-full"></span>
                  )}
              </a>
            </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => handleNavLinkClick("contact")}
                className="ml-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                Contact Me
              </a>
            </li>
          </ul>

          {/* Mobile Menu */}
          <div 
            className={`fixed top-0 right-0 h-screen w-full bg-black/50 backdrop-blur-sm shadow-2xl transition-transform duration-500 ease-out z-50 ${
              showMenu ? "translate-x-0" : "translate-x-full"
            } lg:hidden`}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-lg font-bold bg-gradient-to-r text-[#f44a00] from-[var(--first-color)] to-orange-600 bg-clip-text">
                {settings.siteTitle || "Menu"}
              </h3>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 rounded-full hover:bg-[#1f1f1f] transition-colors"
                aria-label="Close menu"
              >
                <IoClose className="text-2xl text-white" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <ul className="flex flex-col gap-1 p-4">
              {[
                { href: "#home", label: "Home", id: "home" },
                { href: "#about", label: "About", id: "about" },
                { href: "#services", label: "Services", id: "services" },
                { href: "#project", label: "Projects", id: "project" },
                { href: "#contact", label: "Contact", id: "contact" },
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => handleNavLinkClick(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeSection === item.id
                        ? "bg-gradient-to-r from-[var(--first-color)] to-orange-600 !text-white shadow-lg shadow-orange-500/30"
                        : "text-gray-300 hover:bg-[#1f1f1f]"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                      activeSection === item.id ? "bg-white" : "bg-[var(--first-color)]"
                    }`}></span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Overlay */}
          {showMenu && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowMenu(false)}
            />
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors"
              onClick={() => setShowMenu(true)}
              aria-label="Open menu"
            >
              <IoMenu className="text-2xl text-white" />
            </button>
        </div>
      </nav>
    </header>
    </>
  );
};

export default Header;