"use client";

import React, { useState, useEffect } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { useSiteSettings } from "./SiteSettingsProvider";

const Header: React.FC = () => {
  const { settings } = useSiteSettings();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Handle scroll effects and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY >= 20);

      // Section tracking logic
      const sections = ["home", "about", "services", "project", "contact"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust threshold for better accuracy
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavLinkClick = (section: string) => {
    setShowMenu(false);
    setActiveSection(section);
  };

  const navLinks = [
    { href: "#home", label: "Home", id: "home" },
    { href: "#about", label: "About", id: "about" },
    { href: "#services", label: "Services", id: "services" },
    { href: "#project", label: "Projects", id: "project" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--body-color)] shadow-[0_1px_16px_hsla(0,0%,0%,0.35)] py-3"
          : "bg-transparent py-5"
      }`}
      id="header"
    >
      {/* 
        Using 'container mx-auto' to match the global layout width.
        'px-4' ensures consistent gutters with other sections.
      */}
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          
          {/* Logo Section */}
          <a
            href="/#"
            className="flex min-w-0 items-center gap-2 group z-50 relative"
          >
            <div
              className="relative flex shrink-0 items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[var(--first-color)] to-orange-600 shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6"
              aria-hidden
            >
              <span className="text-white font-bold text-lg sm:text-xl font-body">P</span>
            </div>
            <span className="truncate text-base sm:text-xl font-bold text-[var(--title-color)] group-hover:text-[var(--first-color)] transition-colors duration-300 max-w-[40vw] sm:max-w-none">
              {settings.siteTitle || "CodeWithPatrick."}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center bg-white/5 rounded-full px-2 py-1.5 border border-white/5 backdrop-blur-sm">
            <ul className="flex items-center gap-1">
              {navLinks.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => handleNavLinkClick(item.id)}
                    className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:text-white ${
                      activeSection === item.id
                        ? "text-white"
                        : "text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <span className="absolute inset-0 bg-white/10 rounded-full -z-10 animate-fade-in" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button (Desktop) */}
          <div className="hidden lg:block">
            <a
              href="#contact"
              onClick={() => handleNavLinkClick("contact")}
              className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out rounded-full shadow-md shadow-orange-500/20"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-[var(--first-color)] to-orange-600 group-hover:scale-105 transition-transform duration-300"></span>
              <span className="relative flex items-center gap-2">
                Contact Me
                <svg 
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden relative z-50 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Toggle menu"
          >
            {showMenu ? (
              <IoClose className="text-2xl" />
            ) : (
              <IoMenu className="text-2xl" />
            )}
          </button>

          {/* Mobile Menu Overlay */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300 lg:hidden ${
              showMenu ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={() => setShowMenu(false)}
          />

          {/* Mobile Menu Drawer */}
          <div
            className={`fixed top-0 right-0 h-[100svh] w-[min(280px,85vw)] bg-[#1a1a1a] shadow-2xl z-40 transform transition-transform duration-300 ease-out lg:hidden pt-[env(safe-area-inset-top)] ${
              showMenu ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <ul className="flex flex-col gap-2">
                {navLinks.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={() => handleNavLinkClick(item.id)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                        activeSection === item.id
                          ? "bg-gradient-to-r from-[var(--first-color)]/20 to-transparent text-[var(--first-color)] border-l-2 border-[var(--first-color)]"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="text-base font-medium sm:text-lg">{item.label}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#contact"
                    onClick={() => handleNavLinkClick("contact")}
                    className="flex items-center justify-center gap-4 px-4 py-3 mt-4 rounded-xl bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white font-medium shadow-lg shadow-orange-500/20"
                  >
                    Contact Me
                  </a>
                </li>
              </ul>
              
              <div className="mt-auto">
                <p className="text-xs text-center text-gray-600">
                  © {new Date().getFullYear()} {settings.siteTitle || "Portfolio"}.
                </p>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;