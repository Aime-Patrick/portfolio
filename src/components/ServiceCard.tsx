"use client";

import React from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  borderClass?: string;
  /** Disable Framer reveal when parent GSAP gallery controls visibility */
  reveal?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  borderClass,
  reveal = true,
}) => (
  <motion.article
    whileHover={{ y: -6 }}
    initial={reveal ? { opacity: 0, y: 40 } : false}
    whileInView={reveal ? { opacity: 1, y: 0 } : undefined}
    transition={{ duration: 0.45, type: "spring", stiffness: 120 }}
    viewport={{ once: true }}
    className={`group flex h-full min-h-[280px] w-full flex-col items-center justify-center rounded-[1.25rem] bg-[#1a1a1a] px-7 py-10 text-center sm:min-h-[300px] sm:px-8 sm:py-12 ${borderClass ?? ""}`}
  >
    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(18,100%,48%)] text-white shadow-[0_10px_28px_hsla(18,100%,48%,0.45)] transition-transform duration-300 group-hover:scale-105 sm:mb-7 sm:h-16 sm:w-16">
      {icon}
    </div>

    <h3 className="mb-3 max-w-[16ch] text-xl font-bold leading-snug text-white sm:text-2xl">
      {title}
    </h3>

    <p className="max-w-[28ch] text-sm leading-relaxed text-[#a0a0a0] sm:text-base">
      {description}
    </p>
  </motion.article>
);

export default ServiceCard;
