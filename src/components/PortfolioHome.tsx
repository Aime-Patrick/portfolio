"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import HomeSection from "@/Sections/HomeSection";
import SpotlightBackground from "@/components/SpotlightBackground";
import ErrorBoundary from "@/components/ErrorBoundary";
import AssistantGate from "@/components/AssistantGate";

const AboutSection = lazy(() => import("@/Sections/AboutSection"));
const ServicesSection = lazy(() => import("@/Sections/ServicesSection"));
const ProjectsSection = lazy(() => import("@/Sections/ProjectsSection"));
const CertificatesSection = lazy(() => import("@/Sections/CertificatesSection"));
const ContactSection = lazy(() => import("@/Sections/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));

/** Minimal fallback while a lazy chunk downloads — keep layout calm, not skeleton blocks */
const SectionChunkFallback = () => (
  <div className="min-h-[40vh]" aria-hidden />
);

const LazySection = ({
  children,
  rootMargin = "280px",
}: {
  children: React.ReactNode;
  rootMargin?: string;
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  // Off-screen: empty sentinel (no spinner farm). Near viewport: load chunk.
  return (
    <div ref={ref} className="min-h-[1px]">
      {shouldRender ? children : null}
    </div>
  );
};

export default function PortfolioHome() {
  return (
    <ErrorBoundary>
      <SpotlightBackground>
        <Header />
        <main>
          <ErrorBoundary>
            <HomeSection />
          </ErrorBoundary>
          <LazySection>
            <ErrorBoundary>
              <Suspense fallback={<SectionChunkFallback />}>
                <AboutSection />
              </Suspense>
            </ErrorBoundary>
          </LazySection>
          <LazySection>
            <ErrorBoundary>
              <Suspense fallback={<SectionChunkFallback />}>
                <ServicesSection />
              </Suspense>
            </ErrorBoundary>
          </LazySection>
          <LazySection>
            <ErrorBoundary>
              <Suspense fallback={<SectionChunkFallback />}>
                <ProjectsSection />
              </Suspense>
            </ErrorBoundary>
          </LazySection>
          <LazySection>
            <ErrorBoundary>
              <Suspense fallback={<SectionChunkFallback />}>
                <CertificatesSection />
              </Suspense>
            </ErrorBoundary>
          </LazySection>
          <LazySection>
            <ErrorBoundary>
              <Suspense fallback={<SectionChunkFallback />}>
                <ContactSection />
              </Suspense>
            </ErrorBoundary>
          </LazySection>
        </main>
        <LazySection rootMargin="400px">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </LazySection>
      </SpotlightBackground>
      {/* Outside spotlight stacking context so the FAB stays fixed & visible */}
      <ErrorBoundary fallback={null}>
        <AssistantGate />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}
