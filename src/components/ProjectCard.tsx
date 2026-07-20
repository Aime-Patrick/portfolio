"use client";

import React from "react";
import { GoLinkExternal } from "react-icons/go";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

interface ProjectCardProps {
  image: string;
  subtitle: string;
  title: string;
  description: string;
  links?: { url: string; label: string;}[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  image,
  subtitle,
  title,
  description,
  links = [],
}) => {
  const handlePopup = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    window.open(
      url,
      "_blank",
      "width=1000,height=700,noopener,noreferrer"
    );
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35 }}
      className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--container-color)] p-6 transition-colors duration-300 hover:border-[hsl(18,100%,48%)] hover:shadow-lg hover:shadow-orange-900/20 md:p-8"
    >
      <div className="relative mb-6 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-[#222] shadow-lg transition-transform duration-300 group-hover:scale-[1.02]">
        <img
          src={image}
          alt={`Screenshot of project: ${title}`}
          className="h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <p
        className="about-accent relative mb-2 truncate text-sm font-semibold"
        title={subtitle}
      >
        {subtitle}
      </p>

      <h3
        className="relative mb-4 line-clamp-2 text-xl font-bold text-[var(--title-color)] transition-colors duration-300 group-hover:text-[hsl(18,100%,48%)]"
        title={title}
      >
        {title}
      </h3>

      <p className="relative mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--text-color)]">
        {description}
      </p>

      {links.length > 0 && (
        <div className="relative mt-auto flex gap-4">
          {links.map((link, idx) => {
            const isGitHub =
              link.label.toLowerCase().includes("github") ||
              link.url.toLowerCase().includes("github.com");
            const isLive =
              link.label.toLowerCase().includes("live") ||
              link.label.toLowerCase().includes("demo") ||
              (!isGitHub && link.label.toLowerCase() !== "github");

            return (
              <a
                key={idx}
                href={link.url}
                className="about-accent group/link inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:text-white"
                onClick={
                  isLive && !isGitHub
                    ? (e) => handlePopup(e, link.url)
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{link.label}</span>
                {isGitHub && (
                  <FaGithub className="text-sm transition-transform group-hover/link:scale-110" />
                )}
                {isLive && !isGitHub && (
                  <GoLinkExternal className="text-sm transition-transform group-hover/link:translate-x-1" />
                )}
              </a>
            );
          })}
        </div>
      )}
    </motion.article>
  );
};

export default ProjectCard;