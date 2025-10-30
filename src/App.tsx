import React, { lazy, Suspense } from "react";
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

// Loading fallback component
const SectionLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-[var(--first-color)] border-t-transparent rounded-full animate-spin"></div>
  </div>
);


const App: React.FC = () => {
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
              <>
                <Header />
                <main className="main">
                  <HomeSection />
                  <Suspense fallback={<SectionLoader />}>
                    <AboutSection />
                  </Suspense>
                  <Suspense fallback={<SectionLoader />}>
                    <ServicesSection />
                  </Suspense>
                  <Suspense fallback={<SectionLoader />}>
                    <ProjectsSection />
                  </Suspense>
                  <Suspense fallback={<SectionLoader />}>
                    <CertificatesSection />
                  </Suspense>
                  <Suspense fallback={<SectionLoader />}>
                    <ContactSection />
                  </Suspense>
                </main>
                <Suspense fallback={null}>
                  <Chatbot />
                </Suspense>
                <Footer />
                {/* <ScrollUpButton /> */}
              </>
            }
          />
        </Routes>
      </Router>
    </SiteSettingsProvider>
  );
}

export default App;
