"use client";

import React, { useState, useEffect, useRef } from "react";
import ProjectCard from "../components/ProjectCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const fallbackProjects = [
  {
    image: "project-1.png",
    subtitle: "Web App",
    title: "E-commerce Ninjas Store",
    description:
      "E-commerce Ninjas is a dynamic and scalable online shopping platform developed as part of a collaborative project with Andela. The platform aims to provide a seamless shopping experience, catering to various user roles, including Admin, Merchant, and Customer. The project focused on delivering an intuitive user interface, secure transactions, and robust role-based access control (RBAC) to manage different functionalities based on user roles.",
    links: [
      {
        url: "https://github.com/AimePazzo/e-commerce-ninjas",
        label: "GitHub",
      },
      {
        url: "https://e-commerce-ninjas.netlify.app/",
        label: "Live",
      },
    ],
  },
  {
    image: "project-4.jpg",
    subtitle: "Web App",
    title: "Made in Rwanda Website",
    description:
      "Project that you carry out in the design and structure of the layout, showing the design at the client's request.",
    links: [
      {
        url: "https://github.com/AimePazzo/mirwanda-website",
        label: "GitHub",
      },
      {
        url: "https://mirwanda-website.vercel.app/",
        label: "Live",
      },
    ],
  },
];

const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<any[]>(fallbackProjects);

  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(db, "projects");
        const projectsSnapshot = await getDocs(projectsCollection);
        const projectsList = projectsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        if (projectsList.length) setProjects(projectsList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Subtle velocity-based skew — vertical scroll stays normal
  useGSAP(
    () => {
      const section = sectionRef.current;
      const grid = gridRef.current;
      if (!section || !grid) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduceMotion) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        grid.querySelectorAll(".project-velocity-item")
      );
      if (!cards.length) return;

      const proxy = { skew: 0 };
      const clamp = gsap.utils.clamp(-5, 5);
      const skewSetters = cards.map((card, i) =>
        gsap.quickSetter(card, "skewY", "deg")
      );

      // Soft entrance (no scroll hijack)
      gsap.from(cards, {
        autoAlpha: 0,
        y: 36,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
          once: true,
        },
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const nextSkew = clamp(self.getVelocity() / -650);
          // Only chase stronger velocity spikes, then ease back to 0
          if (Math.abs(nextSkew) > Math.abs(proxy.skew)) {
            proxy.skew = nextSkew;
            gsap.to(proxy, {
              skew: 0,
              duration: 0.7,
              ease: "power3",
              overwrite: true,
              onUpdate: () => {
                skewSetters.forEach((set, i) => {
                  // Slight per-card offset so the row feels alive
                  const offset = (i % 3) * 0.35 - 0.35;
                  set(proxy.skew + offset * Math.sign(proxy.skew || 1) * Math.min(1, Math.abs(proxy.skew)));
                });
              },
            });
          }
        },
      });
    },
    {
      scope: sectionRef,
      dependencies: [projects.length],
      revertOnUpdate: true,
    }
  );

  return (
    <section
      ref={sectionRef}
      className="projects section"
      id="project"
      aria-label="Projects section"
    >
      <div className="projects__container container">
        <h2 className="section__title-1 text-3xl md:text-4xl lg:text-5xl mb-8">
          <span>Projects</span>
        </h2>
        <div
          ref={gridRef}
          className="grid place-items-center gap-6 container sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={
            projects.length === 1
              ? {
                  gridTemplateColumns: "1fr",
                  maxWidth: "450px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }
              : undefined
          }
        >
          {projects.map((project, idx) => (
            <div
              key={project.id || idx}
              className="project-velocity-item w-full max-w-[450px] will-change-transform origin-center"
            >
              <ProjectCard {...project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
