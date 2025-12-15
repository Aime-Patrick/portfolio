import React, { useState, useEffect } from "react";
import ServiceCard from "../components/ServiceCard";
import { FiLayout, FiLink2 } from "react-icons/fi";
import { FaLaptopCode } from "react-icons/fa6";
import { GiSmartphone } from "react-icons/gi";
import { FaServer, FaCloud, FaCog, FaDatabase, FaShieldAlt, FaLock, FaMicrochip, FaDocker } from "react-icons/fa";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
// Fallback services data
const defaultServices = [
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

// Map icon string to React component
const getIconComponent = (iconName: string) => {
  switch(iconName) {
    case 'FiLayout':
      return <FiLayout size={32} className="text-white" />;
    case 'FaLaptopCode':
      return <FaLaptopCode size={32} className="text-white" />;
    case 'GiSmartphone':
      return <GiSmartphone size={32} className="text-white" />;
    case 'FaServer':
      return <FaServer size={32} className="text-white" />;
    case 'FaCloud':
      return <FaCloud size={32} className="text-white" />;
    case 'FaMicrochip':
      return <FaMicrochip size={32} className="text-white" />;
    case 'FaCog':
      return <FaCog size={32} className="text-white" />;
    case 'FaDocker':
      return <FaDocker size={32} className="text-white" />;
    case 'FaDatabase':
      return <FaDatabase size={32} className="text-white" />;
    case 'FiLink2':
      return <FiLink2 size={32} className="text-white" />;
    case 'FaShieldAlt':
      return <FaShieldAlt size={32} className="text-white" />;
    case 'FaLock':
      return <FaLock size={32} className="text-white" />;
    default:
      return <FiLayout size={32} className="text-white" />;
  }
};

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const servicesCollection = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesCollection);
        
        if (!servicesSnapshot.empty) {
          const servicesList = servicesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              icon: data.icon ? getIconComponent(data.icon) : null,
              title: data.title,
              description: data.description,
              borderClass: data.borderClass,
            };
          });
          setServices(servicesList);
        } else {
          // Use default services if no data in Firebase
          setServices(defaultServices);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="services section" id="services" aria-label="Services section">
      <h2 className="section__title-2 text-3xl md:text-4xl lg:text-5xl mb-8">
        <span>Services</span>
      </h2>
      {loading ? (
        <div className="container text-center py-8">
          <p>Loading services...</p>
        </div>
      ) : (
        <div className="services__container container grid gap-8">
          {services.map((service, idx) => (
            <ServiceCard key={idx} {...service} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ServicesSection;