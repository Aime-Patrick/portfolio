import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
// import ScrollUpButton from "./components/ScrollUpButton";
import HomeSection from "./Sections/HomeSection";
// Lazy load sections below the fold for better initial load performance
const AboutSection = lazy(() => import("./Sections/AboutSection"));
const ServicesSection = lazy(() => import("./Sections/ServicesSection"));
const ProjectsSection = lazy(() => import("./Sections/ProjectsSection"));
const CertificatesSection = lazy(() => import("./Sections/CertificatesSection"));
const ContactSection = lazy(() => import("./Sections/ContactSection"));
const Chatbot = lazy(() => import("./components/Chatbot"));
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
import ProtectedRoute from "./components/ProtectedRoute";
import SiteSettingsProvider from "./components/SiteSettingsProvider";
import SpotlightBackground from "./components/SpotlightBackground";

// Loading fallback component
const SectionLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-[var(--first-color)] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Render children only once they are near the viewport to avoid loading all
// below-the-fold sections up front.
const LazySection: React.FC<{
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
}> = ({ children, placeholder = <SectionLoader />, rootMargin = "200px" }) => {
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

  return <div ref={ref}>{shouldRender ? children : placeholder}</div>;
};


const App: React.FC = () => {
  const [shouldLoadChatbot, setShouldLoadChatbot] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = (window as typeof window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback?.(
        () => setShouldLoadChatbot(true)
      );
    } else {
      timeoutId = setTimeout(() => setShouldLoadChatbot(true), 1500);
    }

    return () => {
      if (idleId && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as typeof window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <SiteSettingsProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={<SectionLoader />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Suspense fallback={<SectionLoader />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <SpotlightBackground>
                <Header />
                <main>
                  <HomeSection />
                  <LazySection>
                    <Suspense fallback={<SectionLoader />}>
                      <AboutSection />
                    </Suspense>
                  </LazySection>
                  <LazySection>
                    <Suspense fallback={<SectionLoader />}>
                      <ServicesSection />
                    </Suspense>
                  </LazySection>
                  <LazySection>
                    <Suspense fallback={<SectionLoader />}>
                      <ProjectsSection />
                    </Suspense>
                  </LazySection>
                  <LazySection>
                    <Suspense fallback={<SectionLoader />}>
                      <CertificatesSection />
                    </Suspense>
                  </LazySection>
                  <LazySection>
                    <Suspense fallback={<SectionLoader />}>
                      <ContactSection />
                    </Suspense>
                  </LazySection>
                </main>
                {shouldLoadChatbot && (
                  <Suspense fallback={null}>
                    <Chatbot />
                  </Suspense>
                )}
                <Footer />
                {/* <ScrollUpButton /> */}
              </SpotlightBackground>
            }
          />
        </Routes>
      </Router>
    </SiteSettingsProvider>
  );
}

export default App;
