import React from "react";
import ServiceCard from "../components/ServiceCard";
import { FiLayout } from "react-icons/fi";
import { FaLaptopCode } from "react-icons/fa6";
import { GiSmartphone } from "react-icons/gi";
const services = [
  {
    icon: <FiLayout size={32} className="text-white" />,
    title: "Web Design",
    description:
      "Beautiful and elegant designs with interfaces that are intuitive, efficient and pleasant to use for the user.",
  },
  {
    icon: <FaLaptopCode  size={32} className="text-white"/>,
    title: "Development",
    description:
      "Custom web development tailored to your specifications, designed to provide a flawless user experience.",
    borderClass: "second",
  },
  {
    icon: <GiSmartphone size={32} className="text-white" />,
    title: "Mobile App",
    description:
      "Design and transform website projects into mobile apps to provide a seamless user experience.",
  },
];

const ServicesSection: React.FC = () => (
  <section className="services section" id="services" aria-label="Services section">
    <h2 className="section__title-2">
      <span>Services</span>
    </h2>
    <div className="services__container container grid">
      {services.map((service, idx) => (
        <ServiceCard key={idx} {...service} />
      ))}
    </div>
  </section>
);

export default ServicesSection;