"use client";

import React, { useEffect, useRef } from "react";
import { useSiteSettings } from "./SiteSettingsProvider";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaHeart } from "react-icons/fa";
import { RiRobot3Fill } from "react-icons/ri";

const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    const setup = async () => {
      const gsapMod = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const gsap = gsapMod.default;
      gsap.registerPlugin(ScrollTrigger);
      if (cancelled) return;

      const cols = footer.querySelectorAll(".footer-col");
      ctx = gsap.context(() => {
        gsap.from(cols, {
          autoAlpha: 0,
          y: 20,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 92%",
            once: true,
          },
        });
      }, footerRef);

      if (cancelled) ctx.revert();
    };

    void setup();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  const socialClass =
    "flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(18,100%,48%)] text-white transition-all duration-300 hover:scale-110 hover:bg-[hsl(18,90%,42%)] hover:shadow-lg hover:shadow-orange-500/25";

  return (
    <footer
      ref={footerRef}
      className="mt-auto border-t border-[var(--border-color)] bg-[#1a1a1a] py-12 text-white"
    >
      <div className="container">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="footer-col text-center md:text-left">
            <h3 className="about-accent mb-4 text-2xl font-bold">
              {settings.siteTitle || "CodeWithPatrick."}
            </h3>
            <p className="mb-4 text-sm text-[#a0a0a0]">
              {settings.siteDescription ||
                "Building modern web products with clear UX, solid engineering, and AI where it helps."}
            </p>
            <div className="flex justify-center gap-3 md:justify-start">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
            </div>
          </div>

          <div className="footer-col text-center md:text-left">
            <h4 className="mb-4 font-bold text-white">Quick Links</h4>
            <ul className="flex flex-col items-center space-y-2 md:items-start">
              {[
                { name: "Home", href: "#home" },
                { name: "About", href: "#about" },
                { name: "Services", href: "#services" },
                { name: "Projects", href: "#project" },
                { name: "Certificates", href: "#certificates" },
                { name: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-block text-sm text-white/85 transition-colors duration-300 hover:text-[hsl(18,100%,48%)] hover:translate-x-0.5"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col text-center md:text-left">
            <h4 className="mb-4 font-bold text-white">Get In Touch</h4>
            <ul className="flex flex-col items-center space-y-3 md:items-start">
              <li className="flex items-center gap-3 text-sm text-white/85">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(18,100%,48%)]">
                  <FaEnvelope className="text-base text-white" />
                </div>
                <a
                  href="#contact"
                  className="transition-colors duration-300 hover:text-[hsl(18,100%,48%)]"
                >
                  Send a message
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/85">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(18,100%,48%)]">
                  <RiRobot3Fill className="text-base text-white" />
                </div>
                <span>AI Assistant available 24/7</span>
              </li>
            </ul>
            <div className="mt-4 border-t border-[var(--border-color)] pt-4">
              <p className="text-xs text-[#666]">
                Available for freelance work and collaborations
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 border-t border-[var(--border-color)] pt-8 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-sm text-[#a0a0a0]">
            {settings.footerText ||
              `© ${currentYear} NDAGIJIMANA Aime Patrick. All rights reserved.`}
          </p>
          <p className="flex items-center justify-center gap-2 text-sm text-[#a0a0a0]">
            Made with <FaHeart className="text-[hsl(18,100%,48%)]" /> using
            React, TypeScript & Firebase
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
