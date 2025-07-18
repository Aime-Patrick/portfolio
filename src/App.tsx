import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
// import ScrollUpButton from "./components/ScrollUpButton";
import HomeSection from "./Sections/HomeSection";
import AboutSection from "./Sections/AboutSection";
import ServicesSection from "./Sections/ServicesSection";
import ProjectsSection from "./Sections/ProjectsSection";
import ContactSection from "./Sections/ContactSection";
import Chatbot from "./components/Chatbot";

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main className="main">
        <HomeSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Chatbot />
      <Footer />
      {/* <ScrollUpButton /> */}
    </>
  );
}

export default App;
