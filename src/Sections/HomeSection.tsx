import React, { useState, useEffect, useMemo } from "react";
import { IoLogoInstagram } from "react-icons/io5";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TypeAnimation } from 'react-type-animation';
import { motion, type Variants } from "framer-motion";

const defaultTypeSequence = [
  'I am Aime Patrick Ndagijimana',
  'Full Stack & AI Solutions Engineer',
  'Software Engineer',
  'AI Agent Developer',
  'AI Engineer',
];

const buildTypeSequence = (
  items: string[] | undefined,
  onStep: () => void
) => {
  const texts = Array.isArray(items) && items.length > 0 ? items : defaultTypeSequence;
  const sequence: (string | number | (() => void))[] = [];
  texts.forEach((text) => {
    sequence.push(text);
    sequence.push(2500);
    sequence.push(() => onStep());
  });
  return sequence;
};

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
  const [imageShift, setImageShift] = useState(false);
  const [textCycle, setTextCycle] = useState(0);


  
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
  
  const animationSequence = useMemo(
    () => buildTypeSequence(profileData.typeAnimationSequence as string[] | undefined, () => {
      setImageShift((prev) => !prev);
      setTextCycle((prev) => prev + 1);
    }),
    [profileData.typeAnimationSequence]
  );
  
  // Staggered animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic bezier
      } 
    }
  };
  
  return (
    <section 
      className="home section relative overflow-hidden" 
      id="home" 
      aria-label="Home section"
    >
      <motion.div 
        className="home__container container grid w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="home__name" variants={itemVariants}>
          <TypeAnimation
            sequence={animationSequence}
            wrapper="span"
            speed={45}
            style={{ 
              display: 'inline-block',
              background: 'linear-gradient(90deg, var(--first-color), #ff6b35, var(--first-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'bold',
              minHeight: '4.75rem',
              lineHeight: 1.15
            }}
            repeat={Infinity}
            cursor={true}
            className={`typing-text typing-text--fade typing-text--phase-${textCycle % 2}`}
          />
        </motion.h1>

        <div className="home__perfil">
          <motion.div 
            className={`home__image ${imageShift ? 'home__image--shifted' : ''}`}
            variants={itemVariants}
            whileHover={{ scale: 1.02, rotate: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={profileData.profileImage || "/_MAL0853.jpg"} alt={`${profileData.name} portrait`} className="home__img" />
            <div className="home__shadow"></div>
            
            {/* Animated Decor Elements */}
            <motion.img
              src="curved-arrow.svg"
              alt="Curved arrow graphic"
              className="home__arrow dark:invert"
              animate={{ 
                y: [0, -10, 0],
                rotate: [80, 85, 80]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.img
              src="random-lines.svg"
              alt="Decorative random lines"
              className="home__line dark:invert"
              animate={{ 
                x: [0, 5, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div 
              className="geomatric-box"
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </motion.div>

          {/* Social Links with hover effects */}
          <div className="home__social">
            {[
              { component: IoLogoInstagram, link: getSocialLink("instagram"), label: "Instagram" },
              { component: FaLinkedin, link: getSocialLink("linkedin"), label: "LinkedIn" },
              { component: FaGithub, link: getSocialLink("github"), label: "GitHub" }
            ].map(({ component: Icon, link, label }, index) => (
              <motion.a
                key={label}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="home__social-link"
                aria-label={label}
                variants={itemVariants}
                custom={index}
                whileHover={{ y: -5, color: "var(--first-color)" }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </div>

        <motion.div className="home__info" variants={itemVariants}>
          <p className="home__description">
            <b>{profileData.title}</b>, {profileData.bio}
          </p>
          <motion.a 
            href="#about" 
            className="home__scroll" 
            aria-label="Scroll to About section"
            whileHover={{ y: 5 }}
          >
            <div className="home__scroll-box">
              <IoIosArrowDown className="home__scroll-icon" />
            </div>
            <span className="home__scroll-text">Scroll Down</span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HomeSection;