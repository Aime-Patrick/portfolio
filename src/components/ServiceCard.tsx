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
    whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, type: "spring" }}
    viewport={{ once: true }}
    className={`shadow-lg border-2 border-[hsla(14,98%,50%,1)]  p-8 min-h-[340px] flex flex-col items-center justify-center text-center transition hover:shadow-2xl ${borderClass ?? ""}`}
  >
    <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-[hsla(14,98%,50%,1)]">
      {icon}
    </div>
    <h2 className="text-xl font-semibold text-gray-900 mb-3">
      {title}
    </h2>
    <p className="text-gray-600 ">{description}</p>
  </motion.article>
);

export default ServiceCard;
