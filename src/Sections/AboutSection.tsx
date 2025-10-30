import React, { useState, useEffect } from "react";
import { FaLinkedin, FaBriefcase, FaGraduationCap } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AboutData {
  name: string;
  title: string;
  bio: string;
  experience: string;
  education: string;
  skills: string[];
  image: string;
}

const AboutSection: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData>({
    name: "NDAGIJIMANA Aime Patrick",
    title: "Full Stack Developer",
    bio: "Passionate about creating Web Pages with UI/UX User Interface, I have years of experience and many clients are happy with the projects carried out.",
    experience: "3+ years of experience in web development",
    education: "Computer Science degree",
    skills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Node.js", "MongoDB", "REST APIs"],
    image: "/IMG_2949.jpg",
  });
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch from the new 'about' collection
        const aboutDoc = doc(db, 'about', 'main');
        const aboutSnapshot = await getDoc(aboutDoc);
        
        if (aboutSnapshot.exists()) {
          const data = aboutSnapshot.data() as AboutData;
          setAboutData(data);
        }
        
        // Also fetch profile data for LinkedIn URL
        const profileDoc = doc(db, 'profile', 'main');
        const profileSnapshot = await getDoc(profileDoc);
        
        if (profileSnapshot.exists()) {
          setProfileData(profileSnapshot.data());
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper function to get social link URL
  const getLinkedinUrl = () => {
    const link = profileData.socialLinks?.find((link: any) => 
      link.platform.toLowerCase() === 'linkedin'
    );
    return link?.url || "https://www.linkedin.com/";
  };
  
  if (loading) {
    return (
      <section className="about section" id="about">
        <div className="container text-center py-16">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </section>
    );
  }
  
  return (
  <section className="about section" id="about" aria-label="About section">
    <div className="about__container container grid">
      <h2 className="section__title-1">
        <span>About Me</span>
      </h2>
      <div className="about__perfil">
        <div className="about__image">
          <img
            src={aboutData.image || "/IMG_2949.jpg"}
            alt={`${aboutData.name} working at a desk`}
            className="about__img"
            loading="lazy"
            decoding="async"
          />
          <div className="about__shadow"></div>
          <div className="geomatric-box"></div>
          <img
            src="/random-lines.svg"
            alt="Decorative random lines"
            className="about__line"
          />
          <div className="about__box"></div>
        </div>
      </div>
      <div className="about__info">
        <p className="relative text-[#000000] dark:text-gray-300 mb-6 text-2xl font-medium">
          {aboutData.bio}
        </p>
        
        {/* Experience */}
        <div 
          className="mb-4 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group hover:animate-none"
          style={{
            '--border-angle': '0turn',
            border: 'solid 3px transparent',
            background: `
              linear-gradient(var(--body-color), var(--body-color)) padding-box,
              conic-gradient(
                from var(--border-angle),
                transparent 20%,
                #ff6b35,
                #f44a00,
                #2a2a2a,
                #141414 50%,
                #2a2a2a,
                #f44a00,
                #ff6b35,
                transparent 80%
              ) border-box,
              linear-gradient(var(--body-color), var(--body-color)) border-box
            `,
            animation: 'border-spin 3s linear infinite',
          } as React.CSSProperties}
        >
          <div className="flex items-center gap-2 mb-2">
            <FaBriefcase className="text-[var(--first-color)] text-lg" />
            <h3 className="font-bold text-[#000000] dark:text-white">Experience</h3>
          </div>
          <p className="text-sm text-[#000000] dark:text-gray-400">{aboutData.experience}</p>
        </div>
        
        {/* Education */}
        <div 
          className="mb-4 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group hover:animate-none"
          style={{
            '--border-angle': '0turn',
            border: 'solid 3px transparent',
            background: `
              linear-gradient(var(--body-color), var(--body-color)) padding-box,
              conic-gradient(
                from var(--border-angle),
                transparent 20%,
                #ff6b35,
                #f44a00,
                #2a2a2a,
                #141414 50%,
                #2a2a2a,
                #f44a00,
                #ff6b35,
                transparent 80%
              ) border-box,
              linear-gradient(var(--body-color), var(--body-color)) border-box
            `,
            animation: 'border-spin 3s linear infinite',
          } as React.CSSProperties}
        >
          <div className="flex items-center gap-2 mb-2">
            <FaGraduationCap className="text-[var(--first-color)] text-lg" />
            <h3 className="font-bold text-[#000000] dark:text-white">Education</h3>
          </div>
          <p className="text-sm text-[#000000] dark:text-gray-400">{aboutData.education}</p>
        </div>
        
        {/* Skills */}
        {aboutData.skills && aboutData.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-[#000000] dark:text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {aboutData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white text-xs font-medium rounded-full shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="about__buttons">
          <a href="#contact" className="button" aria-label="Contact Aime Patrick Ndagijimana">
            <i className="ri-send-plane-line"></i>
            Contact Me
          </a>
          <a
            href={getLinkedinUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="button__ghost"
            aria-label="LinkedIn profile of Aime Patrick Ndagijimana"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>
  </section>
);
};

export default AboutSection;