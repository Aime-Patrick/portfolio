import React from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  borderClass?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  borderClass,
}) => (
  <motion.article
    whileHover={{ y: -8 }}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    viewport={{ once: true }}
    className={`group relative px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9 min-h-[250px] sm:min-h-[280px] lg:min-h-[320px] w-full flex flex-col items-center justify-between text-center transition-all duration-300 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 hover:animate-none ${borderClass ?? ""}`}
    style={{
      '--border-angle': '0turn',
      border: 'solid 4px transparent',
      background: `
        linear-gradient(var(--body-color), var(--body-color)) padding-box,
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
        linear-gradient(var(--body-color), var(--body-color)) border-box
      `,
      animation: 'border-spin 3s linear infinite',
    } as React.CSSProperties}
  >
    {/* Background gradient on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--first-color)]/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    {/* Icon container with gradient */}
    <div className="relative mb-5 sm:mb-6 flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gray-200 dark:bg-[#f44a00] shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/10 dark:to-transparent rounded-2xl animate-pulse"></div>
      {icon}
    </div>
    
    {/* Title */}
    <h3 className="relative text-lg sm:text-xl lg:text-2xl font-bold text-[#000000] dark:text-white mb-2 sm:mb-3 lg:mb-4 bg-gradient-to-r from-[#000000] to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text group-hover:text-transparent transition-all duration-300">
      {title}
    </h3>
    
    {/* Description */}
    <p className="relative text-[#000000] dark:text-gray-300 leading-relaxed text-sm sm:text-base">
      {description}
    </p>
    
    {/* Decorative corner elements */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[var(--first-color)]/10 to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </motion.article>
);

export default ServiceCard;
