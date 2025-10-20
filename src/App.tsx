import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
// import ScrollUpButton from "./components/ScrollUpButton";
import HomeSection from "./Sections/HomeSection";
import AboutSection from "./Sections/AboutSection";
import ServicesSection from "./Sections/ServicesSection";
import ProjectsSection from "./Sections/ProjectsSection";
import CertificatesSection from "./Sections/CertificatesSection";
import ContactSection from "./Sections/ContactSection";
import Chatbot from "./components/Chatbot";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SiteSettingsProvider from "./components/SiteSettingsProvider";


const App: React.FC = () => {
  return (
    <SiteSettingsProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<AdminLogin />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
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
                  <AboutSection />
                  <ServicesSection />
                  <ProjectsSection />
                  <CertificatesSection />
                  <ContactSection />
                </main>
                <Chatbot />
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
