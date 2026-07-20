"use client";

import React, { useState, useEffect, useRef } from "react";
import ServiceCard from "../components/ServiceCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getServiceIconComponent } from "@/lib/serviceIcons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const defaultServices = [
  {
    icon: getServiceIconComponent("FiLayout"),
    title: "Web Design",
    description:
      "Beautiful and elegant designs with interfaces that are intuitive, efficient and pleasant to use for the user.",
  },
  {
    icon: getServiceIconComponent("FaLaptopCode"),
    title: "Development",
    description:
      "Custom web development tailored to your specifications, designed to provide a flawless user experience.",
    borderClass: "second",
  },
  {
    icon: getServiceIconComponent("GiSmartphone"),
    title: "Mobile App",
    description:
      "Design and transform website projects into mobile apps to provide a seamless user experience.",
  },
];

type ServiceItem = {
  id?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  borderClass?: string;
};

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, "services");
        const servicesSnapshot = await getDocs(servicesCollection);

        if (!servicesSnapshot.empty) {
          const servicesList = servicesSnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              icon: data.icon ? getServiceIconComponent(data.icon) : null,
              title: data.title,
              description: data.description,
              borderClass: data.borderClass,
            };
          });
          setServices(servicesList);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  useGSAP(
    () => {
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!pin || !track || services.length < 2) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduceMotion) return;

      const getScrollAmount = () => {
        const overflow = track.scrollWidth - pin.clientWidth;
        return Math.max(0, overflow);
      };

      // Desktop / tablet: pin + horizontal scrub
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const tween = gsap.to(track, {
          x: () => -getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${getScrollAmount() + window.innerHeight * 0.35}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(track, { clearProps: "transform" });
        };
      });

      // Mobile: native horizontal scroll (no pin)
      mm.add("(max-width: 767px)", () => {
        gsap.set(track, { clearProps: "transform" });
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    {
      scope: sectionRef,
      dependencies: [services.length],
      revertOnUpdate: true,
    }
  );

  return (
    <section
      ref={sectionRef}
      className="services section relative"
      id="services"
      aria-label="Services section"
    >
      <div ref={pinRef} className="services-gallery relative min-h-[100svh]">
        <div className="container mx-auto px-4 pt-24 pb-6 lg:pt-28">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="about-accent mb-2 text-xs font-semibold uppercase tracking-[0.2em]">
                What I offer
              </p>
              <h2 className="section__title-2 !mb-0 text-3xl md:text-4xl lg:text-5xl">
                <span>Services</span>
              </h2>
            </div>
            <p className="hidden text-sm text-[var(--text-muted)] md:block">
              Scroll to explore →
            </p>
          </div>
        </div>

        <div className="services-gallery__viewport overflow-x-auto md:overflow-hidden px-4 pb-16 md:px-0">
          <div
            ref={trackRef}
            className="services-gallery__track flex w-max gap-5 px-0 md:gap-6 md:px-[max(1rem,calc((100vw-72rem)/2+1rem))] will-change-transform"
          >
            {services.map((service, idx) => (
              <div
                key={service.id || idx}
                className="services-gallery__item w-[min(85vw,320px)] shrink-0 sm:w-[340px] lg:w-[380px]"
              >
                <ServiceCard {...service} reveal={false} />
              </div>
            ))}
            <div className="hidden w-[10vw] shrink-0 md:block" aria-hidden />
          </div>
        </div>

        <p className="px-4 pb-8 text-center text-xs text-[var(--text-muted)] md:hidden">
          Swipe sideways to browse services
        </p>
      </div>
    </section>
  );
};

export default ServicesSection;
