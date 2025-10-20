import React, { useState, useEffect } from "react";
import { IoLogoInstagram } from "react-icons/io5";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TypeAnimation } from 'react-type-animation';
const HomeSection: React.FC = () => {
  const [profileData, setProfileData] = useState<any>({
    name: "Aime Patrick Ndagijimana",
    title: "Software Engineer",
    bio: "with knowledge in web development and design, I offer the best projects resulting in quality work.",
    profileImage: "/_MAL0853.jpg",
    socialLinks: [
      { platform: "instagram", url: "https://www.instagram.com/" },
      { platform: "linkedin", url: "https://www.linkedin.com/in/ndagijimana-patrick-393ba5226" },
      { platform: "github", url: "https://www.github.com/AimePazzo" }
    ]
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
  const getSocialLink = (platform: string) => {
    const link = profileData.socialLinks?.find((link: any) => 
      link.platform.toLowerCase() === platform.toLowerCase()
    );
    return link?.url || "#";
  };
  
  return (
  <section className="home section" id="home" aria-label="Home section">
    <div className="home__container container grid">
      <h1 className="home__name">
        <TypeAnimation
          sequence={[
            'I am Aime Patrick Ndagijimana',
            3000,
            'Full Stack & AI Solutions Engineer',
            3000,
            'Software Engineer',
            3000,
            'AI Agent Developer',
            3000,
            'AI Engineer',
            3000,
          ]}
          wrapper="span"
          speed={50}
          style={{ 
            display: 'inline-block',
            background: 'linear-gradient(90deg, var(--first-color), #ff6b35, var(--first-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 'bold',
            minHeight: '4.5rem'
          }}
          repeat={Infinity}
          cursor={true}
          className="typing-text"
        />
      </h1>
      <div className="home__perfil">
        <div className="home__image">
          <img src={profileData.profileImage || "/_MAL0853.jpg"} alt={`${profileData.name} portrait`} className="home__img" />
          <div className="home__shadow"></div>
          <img
            src="curved-arrow.svg"
            alt="Curved arrow graphic"
            className="home__arrow dark:invert"
          />
          <img
            src="random-lines.svg"
            alt="Decorative random lines"
            className="home__line dark:invert"
          />
          <div className="geomatric-box"></div>
        </div>
        <div className="home__social">
          <a
            href={getSocialLink("instagram")}
            target="_blank"
            rel="noopener noreferrer"
            className="home__social-link"
            aria-label="Instagram"
          >
            <IoLogoInstagram />
          </a>
          <a
            href={getSocialLink("linkedin")}
            target="_blank"
            rel="noopener noreferrer"
            className=" home__social-link"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href={getSocialLink("github")}
            target="_blank"
            rel="noopener noreferrer"
            className="home__social-link"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
        </div>
      </div>
      <div className="home__info">
        <p className="home__description">
          <b>{profileData.title}</b>, {profileData.bio}
        </p>
        <a href="#about" className="home__scroll" aria-label="Scroll to About section">
          <div className="home__scroll-box">
            <IoIosArrowDown className="home__scroll-icon" />
          </div>
          <span className="home__scroll-text">Scroll Down</span>
        </a>
      </div>
    </div>
  </section>
);
};

export default HomeSection;