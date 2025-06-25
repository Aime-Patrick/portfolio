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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      viewport={{ once: true, amount: 0.2 }}
      className="project__card w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-md overflow-hidden flex flex-col"
    >
      <div className="w-full h-48 overflow-hidden flex items-center justify-center bg-gray-100">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full"
          style={{ minHeight: "12rem", maxHeight: "12rem" }}
        />
      </div>
      <div className="project__content p-4 flex-1 flex flex-col">
        <span className="project__subtitle text-sm text-gray-500">{subtitle}</span>
        <h3 className="project__title text-lg font-semibold mt-1 mb-2">{title}</h3>
        <p className="project__description text-gray-700 flex-1">
          {description && description.length > 80
            ? description.slice(0, 80) + "..."
            : description}
        </p>
        {links.length > 0 && (
          <div className="project__buttons flex gap-2 mt-4">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                className="project__link flex items-center gap-1 text-blue-600 hover:underline"
                onClick={idx === 1 ? (e) => handlePopup(e, link.url) : undefined}
                target={idx === 0 ? "_blank" : undefined}
                rel="noopener noreferrer"
              >
                {link.label}
                {idx === 0 && <FaGithub className="project__icon" />}
                {idx === 1 && <GoLinkExternal className="project__icon" />}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default ProjectCard;