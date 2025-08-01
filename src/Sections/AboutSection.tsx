import React, { useState, useEffect } from "react";
import { FaLinkedin } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AboutSection: React.FC = () => {
  const [profileData, setProfileData] = useState<any>({
    name: "Aime Patrick Ndagijimana",
    bio: "Passionate about creating Web Pages with UI/UX User Interface, I have years of experience and many clients are happy with the projects carried out.",
    skills: ["HTML", "CSS & SCSS", "JavaScript", "React", "React Native", "Bootstrap", "Tailwind", "Figma", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "MySQL", "REST APIs"],
    aboutImage: "/IMG_2949.jpg",
    linkedinUrl: "https://www.linkedin.com/"
  });
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileDoc = doc(db, 'profile', 'main');
        const profileSnapshot = await getDoc(profileDoc);
        
        if (profileSnapshot.exists()) {
          const data = profileSnapshot.data();
          setProfileData({
            ...profileData,
            ...data
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfileData();
  }, []);
  
  // Helper function to get social link URL
  const getLinkedinUrl = () => {
    const link = profileData.socialLinks?.find((link: any) => 
      link.platform.toLowerCase() === 'linkedin'
    );
    return link?.url || "https://www.linkedin.com/";
  };
  
  // Helper function to group skills
  const getFrontendSkills = () => {
    const frontendSkills = profileData.skills?.filter((skill: string) => 
      ['HTML', 'CSS', 'SCSS', 'JavaScript', 'React', 'React Native', 'Bootstrap', 'Tailwind', 'Figma', 'TypeScript'].some(s => 
        skill.toLowerCase().includes(s.toLowerCase())
      )
    );
    return frontendSkills?.join(', ') || "HTML, CSS & SCSS, JavaScript, React, React Native, Bootstrap, Tailwind, Figma, TypeScript";
  };
  
  const getBackendSkills = () => {
    const backendSkills = profileData.skills?.filter((skill: string) => 
      ['Node', 'MongoDB', 'PostgreSQL', 'MySQL', 'REST', 'API', 'Express', 'Backend', 'Server'].some(s => 
        skill.toLowerCase().includes(s.toLowerCase())
      )
    );
    return backendSkills?.join(', ') || "Node.js, MongoDB, PostgreSQL, MySQL, REST APIs";
  };
  
  return (
  <section className="about section" id="about" aria-label="About section">
    <div className="about__container container !grid">
      <h2 className="section__title-1">
        <span>About Me</span>
      </h2>
      <div className="about__perfil">
        <div className="about__image">
          <img
            src={profileData.aboutImage || "/IMG_2949.jpg"}
            alt={`${profileData.name} working at a desk`}
            className="about__img"
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
        <p className="about__description">
          {profileData.aboutBio || profileData.bio || "Passionate about creating Web Pages with UI/UX User Interface, I have years of experience and many clients are happy with the projects carried out."}
        </p>
        <ul className="about__list">
          <li className="about__item">
            <b>Frontend Skills:</b> {getFrontendSkills()}
          </li>
          <li className="about__item">
            <b>Backend Skills:</b> {getBackendSkills()}
          </li>
        </ul>
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