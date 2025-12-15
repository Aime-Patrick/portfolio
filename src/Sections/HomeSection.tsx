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
        <motion.h1 className="home__name text-center lg:text-left mt-6 md:mt-0 relative z-10" variants={itemVariants}>
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
              minHeight: '50px', // Fixed height for mobile to prevent jumping
              lineHeight: 0.9
            }}
            repeat={Infinity}
            cursor={true}
            className={`typing-text typing-text--fade typing-text--phase-${textCycle % 2} text-2xl sm:text-2xl lg:text-4xl max-w-[600px]`}
          />
        </motion.h1>

        <div className="home__perfil relative flex flex-col items-center">
          <motion.div 
            className="home__image w-[280px] h-[350px] sm:w-[320px] sm:h-[400px] lg:w-[450px] lg:h-[550px] mx-auto"
            variants={itemVariants}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src={profileData.profileImage || "/_MAL0853.jpg"} 
              alt={`${profileData.name} portrait`} 
              className="home__img w-full h-full object-cover rounded-3xl relative z-10" 
            />
            <div className="home__shadow  absolute top-2 right-0 lg:-right-2  w-[calc(70%+1rem)] h-[calc(80%+1rem)] border-4 border-[var(--first-color)] rounded-3xl z-[-1] bg-[var(--container-color)]"></div>
            
            {/* Animated Decor Elements */}
            <motion.img
              src="curved-arrow.svg"
              alt="Curved arrow graphic"
              className="home__arrow absolute top-8 right-0 lg:-right-8 w-[50px] sm:w-[80px] z-20"
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
              className="home__line absolute bottom-12 lg:-left-8 w-[50px] sm:w-[80px] z-20"
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
          </motion.div>

          {/* Social Links - Responsive Position: Bottom Center on Mobile, Side on Desktop */}
          <div className="home__social relative z-20 flex justify-center gap-6 mt-12 lg:absolute lg:top-5 lg:-right-16 lg:flex-col lg:gap-6 lg:mt-0">
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
                className="home__social-link text-2xl text-[var(--text-color)] hover:text-[var(--first-color)] transition-colors p-[6px] bg-[var(--black-color-light)] hover:bg-[var(--color-black)] grid place-items-center"
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

        <motion.div className="home__info mt-8 lg:mt-16 text-center px-4" variants={itemVariants}>
          <p className="home__description mb-6 text-[var(--title-color)]">
            <b className="bg-gradient-to-r from-[var(--first-color)] via-[#ff6b35] to-[var(--first-color)] text-transparent bg-clip-text pr-1 font-bold">{profileData.title}</b>, {profileData.bio}
          </p>
          <motion.a 
            href="#about" 
            className="home__scroll block w-max mx-auto" 
            aria-label="Scroll to About section"
            whileHover={{ y: 5 }}
          >
            <div className="home__scroll-box w-9 h-9 bg-[var(--color-black)] text-white grid place-items-center text-base cursor-pointer overflow-hidden transition-colors hover:bg-[var(--first-color)]">
              <IoIosArrowDown className="home__scroll-icon animate-bounce" />
            </div>
            <span className="home__scroll-text hidden">Scroll Down</span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HomeSection;