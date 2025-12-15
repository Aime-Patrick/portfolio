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
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      viewport={{ once: true }}
      className="group relative p-8 min-h-[320px] flex flex-col transition-all duration-300 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/20"
      style={{
        '--border-angle': '0turn',
        border: 'solid 4px transparent',
        background: `
          linear-gradient(var(--container-color), var(--container-color)) padding-box,
          conic-gradient(
            from var(--border-angle),
            transparent 20%,
            #ff6b35,
            #f44a00,
            #2a2a2a,
            #141414 50%,
            #2a2a2a,
            #f44a00,
            #ff6b35,
            transparent 80%
          ) border-box,
          linear-gradient(var(--container-color), var(--container-color)) border-box
        `,
        animation: 'border-spin 3s linear infinite',
      } as React.CSSProperties}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--first-color)]/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Image */}
      <div className="relative mb-6 w-full h-40 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <img
          src={image}
          alt={`Screenshot of project: ${title}`}
          className="w-full h-full object-cover object-center"
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Subtitle */}
      <p className="relative text-sm text-[var(--first-color)] font-semibold mb-2 truncate" title={subtitle}>
        {subtitle}
      </p>

      {/* Title */}
      <h3 className="relative text-xl font-bold text-[#000000] dark:text-white mb-4 bg-gradient-to-r from-[#000000] to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2" title={title}>
        {title}
      </h3>

      {/* Description */}
      <p className="relative text-[#000000] dark:text-gray-300 leading-relaxed text-sm mb-4 line-clamp-3 flex-1">
        {description}
      </p>

      {/* Links */}
      {links.length > 0 && (
        <div className="relative flex gap-4 mt-auto">
          {links.map((link, idx) => {
            // Determine icon based on label, not index
            const isGitHub = link.label.toLowerCase().includes('github') || link.url.toLowerCase().includes('github.com');
            const isLive = link.label.toLowerCase().includes('live') || link.label.toLowerCase().includes('demo') || (!isGitHub && link.label.toLowerCase() !== 'github');
            
            return (
              <a
                key={idx}
                href={link.url}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--first-color)] hover:text-white transition-colors group/link"
                onClick={isLive && !isGitHub ? (e) => handlePopup(e, link.url) : undefined}
                target={isGitHub ? "_blank" : "_blank"}
                rel="noopener noreferrer"
              >
                <span>{link.label}</span>
                {isGitHub && <FaGithub className="text-sm group-hover/link:scale-110 transition-transform" />}
                {isLive && !isGitHub && <GoLinkExternal className="text-sm group-hover/link:translate-x-1 transition-transform" />}
              </a>
            );
          })}
        </div>
      )}


    </motion.article>
  );
};

export default ProjectCard;