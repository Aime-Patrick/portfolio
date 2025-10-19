import React from "react";
import { useSiteSettings } from "./SiteSettingsProvider";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaHeart } from 'react-icons/fa';
import { RiRobot3Fill } from 'react-icons/ri';

const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#1f1f1f] text-white py-12 mt-auto border-t border-gray-800/50 transition-all duration-300">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[var(--first-color)] to-orange-600 bg-clip-text text-transparent mb-4">
              {settings.siteTitle || "CodeWithPatrick."}
            </h3>
            <p className="text-gray-400 mb-4 text-sm">
              {settings.siteDescription || "Building amazing web experiences with modern technologies. Passionate about creating elegant solutions to complex problems."}
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <a 
                href={"https://github.com"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 bg-[#f44a00] text-white hover:bg-[var(--first-color)] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/30"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a 
                href={"https://linkedin.com"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 bg-[#f44a00] text-white hover:bg-[var(--first-color)] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/30"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a 
                href={"https://twitter.com"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 bg-[#f44a00] text-white hover:bg-[var(--first-color)] hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/30"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 flex flex-col items-center md:items-start">
              {[
                { name: 'Home', href: '#home' },
                { name: 'About', href: '#about' },
                { name: 'Services', href: '#services' },
                { name: 'Projects', href: '#project' },
                { name: 'Certificates', href: '#certificates' },
                { name: 'Contact', href: '#contact' }
              ].map(link => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-white/90 hover:text-[var(--first-color)] transition-colors duration-300 text-sm inline-block hover:translate-x-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h4 className="font-bold mb-4 text-white">Get In Touch</h4>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
              <li className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-8 h-8 bg-[#f44a00] rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-white text-base" />
                </div>
                <a href="#contact" className="hover:text-[var(--first-color)] transition-colors duration-300">
                  Send a message
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-8 h-8 bg-[#f44a00] rounded-full flex items-center justify-center flex-shrink-0">
                  <RiRobot3Fill className="text-white text-base" />
                </div>
                <span>AI Assistant available 24/7</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <p className="text-xs text-gray-500">
                Available for freelance work and collaborations
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-center md:text-left">
          <p className="text-gray-400 text-sm">
            {settings.footerText || `© ${currentYear} NDAGIJIMANA Aime Patrick. All rights reserved.`}
          </p>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            Made with <FaHeart className="text-red-500 animate-pulse" /> using React, TypeScript & Firebase
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;