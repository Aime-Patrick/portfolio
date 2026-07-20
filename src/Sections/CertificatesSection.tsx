"use client";

import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaAward, FaExternalLinkAlt, FaCalendar } from "react-icons/fa";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  credentialUrl?: string;
}

const CertificatesSection: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const certificatesCollection = collection(db, "certificates");
        const certificatesSnapshot = await getDocs(certificatesCollection);
        const certificatesList = certificatesSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Certificate[];

        certificatesList.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setCertificates(certificatesList);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  useGSAP(
    () => {
      const grid = gridRef.current;
      if (loading || !grid || certificates.length === 0) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduceMotion) return;

      const cards = grid.querySelectorAll(".cert-card");
      gsap.from(cards, {
        autoAlpha: 0,
        y: 32,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
          once: true,
        },
      });
    },
    {
      scope: sectionRef,
      dependencies: [loading, certificates.length],
      revertOnUpdate: true,
    }
  );

  // No public loading UI — hide until we know there are certificates
  if (loading || certificates.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="certificates section"
      id="certificates"
      aria-label="Certificates and achievements"
    >
      <div className="container mb-8">
        <p className="about-accent mb-2 text-xs font-semibold uppercase tracking-[0.2em]">
          Credentials
        </p>
        <h2 className="section__title-2 !mb-0 text-3xl md:text-4xl lg:text-5xl">
          <span>Certificates & Achievements</span>
        </h2>
      </div>

      <div
        ref={gridRef}
        className="certificates__container container grid gap-6 md:gap-8"
        style={
          certificates.length === 1
            ? {
                gridTemplateColumns: "1fr",
                maxWidth: "360px",
                marginLeft: "auto",
                marginRight: "auto",
              }
            : undefined
        }
      >
        {certificates.map((cert) => (
          <article
            key={cert.id}
            className="cert-card group flex min-h-[320px] flex-col overflow-hidden rounded-[1.25rem] bg-[#1a1a1a] p-6 text-center transition-transform duration-300 hover:-translate-y-1.5 md:p-8"
          >
            <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl bg-[#222]">
              <img
                src={cert.image}
                alt={cert.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(18,100%,48%)] shadow-[0_8px_20px_hsla(18,100%,48%,0.4)]">
                <FaAward className="text-sm text-white" />
              </div>
            </div>

            <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-[hsl(18,100%,48%)]">
              {cert.title}
            </h3>

            <p className="about-accent mb-3 text-sm font-semibold">
              {cert.issuer}
            </p>

            <div className="mb-4 flex items-center justify-center gap-2 text-xs text-[#a0a0a0]">
              <FaCalendar className="text-[10px]" />
              <span>
                {new Date(cert.date).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-[#a0a0a0]">
              {cert.description}
            </p>

            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-accent group/link mt-auto inline-flex items-center justify-center gap-2 text-sm font-semibold hover:underline"
              >
                <span>View credential</span>
                <FaExternalLinkAlt className="text-xs transition-transform group-hover/link:translate-x-0.5" />
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default CertificatesSection;
