import React, { useState, useEffect } from "react";
import { FaLinkedin, FaBriefcase, FaGraduationCap, FaInfoCircle } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Dialog from '../components/Dialog';

interface Experience {
  id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

interface AboutData {
  name: string;
  title: string;
  bio: string;
  experience: string | Experience[];
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
  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [allExperiencesDialogOpen, setAllExperiencesDialogOpen] = useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  // Truncate bio to show only first 150 characters
  const getTruncatedBio = (bio: string, maxLength: number = 150) => {
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength) + '...';
  };

  // Convert experience string to array format for backward compatibility
  const getExperiences = (): Experience[] => {
    if (Array.isArray(aboutData.experience)) {
      return aboutData.experience;
    }
    // If it's still a string, convert it to an array with a single item
    if (typeof aboutData.experience === 'string' && aboutData.experience.trim()) {
      return [{
        title: 'Experience',
        description: aboutData.experience,
        shortDescription: aboutData.experience.substring(0, 100) + '...',
      }];
    }
    return [];
  };
  
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
    <div className="about__container container grid w-full">
      <h2 className="section__title-1 text-3xl md:text-4xl lg:text-5xl mb-8">
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
        {/* Bio Section with Read More */}
        <div className="relative mb-6">
          <p className="relative text-[#000000] dark:text-gray-300 text-2xl font-medium leading-relaxed" style={{ display: 'inline-block', width: '100%' }}>
            {aboutData.bio && aboutData.bio.length > 150 ? (
              <>
                {getTruncatedBio(aboutData.bio)}
                <button
                  onClick={() => setBioDialogOpen(true)}
                  className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
                  aria-label="Read full bio"
                  style={{ 
                    display: 'inline-flex',
                    verticalAlign: 'middle',
                    marginLeft: '8px',
                    marginBottom: '0'
                  }}
                >
                  <FaInfoCircle className="text-xs" />
                </button>
              </>
            ) : (
              aboutData.bio
            )}
          </p>
        </div>
        
        {/* Experience Section - Cards Display */}
        {getExperiences().length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBriefcase className="text-[var(--first-color)] text-lg" />
              <h3 className="font-bold text-[#000000] dark:text-white text-xl">Experience</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getExperiences().slice(0, 2).map((exp, index) => (
                <button
                  key={exp.id || index}
                  onClick={() => {
                    setSelectedExperience(exp);
                    setExperienceDialogOpen(true);
                  }}
                  className="group relative p-4 bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 border-2 border-orange-500/30 rounded-xl shadow-lg hover:shadow-xl hover:border-orange-500/60 transition-all duration-300 hover:scale-[1.02] text-left"
                  aria-label={`View ${exp.title || 'experience'} details`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-[#000000] dark:text-white text-lg group-hover:text-[var(--first-color)] transition-colors">
                        {exp.title || 'Untitled Experience'}
                      </h4>
                      <FaInfoCircle className="text-[var(--first-color)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>
                    {exp.company && (
                      <p className="text-sm text-orange-400 font-medium">{exp.company}</p>
                    )}
                    {(exp.startDate || exp.endDate) && (
                      <p className="text-xs text-[#000000]/70 dark:text-gray-400">
                        {exp.startDate || 'N/A'}
                        {exp.isCurrent ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''}
                      </p>
                    )}
                    <p className="text-sm text-[#000000]/80 dark:text-gray-300 line-clamp-3 mt-2">
                      {exp.shortDescription || (exp.description ? exp.description.substring(0, 120) + '...' : 'No description available')}
                    </p>
                    <span className="text-xs text-[var(--first-color)] font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to read more →
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {getExperiences().length > 2 && (
              <button
                onClick={() => setAllExperiencesDialogOpen(true)}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                aria-label="View all experiences"
              >
                Click to read more →
              </button>
            )}
          </div>
        )}
        
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
            <div className="flex flex-wrap gap-2 mb-3" style={{ maxHeight: '120px', overflow: 'hidden' }}>
              {aboutData.skills.slice(0, 12).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white text-xs font-medium rounded-full shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
            {aboutData.skills.length > 12 && (
              <button
                onClick={() => setSkillsDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                aria-label="View all skills"
              >
                View All
              </button>
            )}
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

      {/* Bio Dialog */}
      <Dialog
        isOpen={bioDialogOpen}
        onClose={() => setBioDialogOpen(false)}
        title="About Me"
      >
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {aboutData.bio}
          </p>
        </div>
      </Dialog>

      {/* All Experiences Dialog */}
      <Dialog
        isOpen={allExperiencesDialogOpen}
        onClose={() => setAllExperiencesDialogOpen(false)}
        title="All Experiences"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {getExperiences().map((exp, index) => (
            <button
              key={exp.id || index}
              onClick={() => {
                setSelectedExperience(exp);
                setAllExperiencesDialogOpen(false);
                setExperienceDialogOpen(true);
              }}
              className="group relative p-4 bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 border-2 border-orange-500/30 rounded-xl shadow-lg hover:shadow-xl hover:border-orange-500/60 transition-all duration-300 hover:scale-[1.02] text-left"
              aria-label={`View ${exp.title || 'experience'} details`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-lg group-hover:text-[var(--first-color)] transition-colors">
                    {exp.title || 'Untitled Experience'}
                  </h4>
                  <FaInfoCircle className="text-[var(--first-color)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
                {exp.company && (
                  <p className="text-sm text-orange-400 font-medium">{exp.company}</p>
                )}
                {(exp.startDate || exp.endDate) && (
                  <p className="text-xs text-gray-400">
                    {exp.startDate || 'N/A'}
                    {exp.isCurrent ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''}
                  </p>
                )}
                <p className="text-sm text-gray-300 line-clamp-3 mt-2">
                  {exp.shortDescription || (exp.description ? exp.description.substring(0, 120) + '...' : 'No description available')}
                </p>
                <span className="text-xs text-[var(--first-color)] font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to read more →
                </span>
              </div>
            </button>
          ))}
        </div>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog
        isOpen={experienceDialogOpen}
        onClose={() => {
          setExperienceDialogOpen(false);
          setSelectedExperience(null);
        }}
        title={selectedExperience?.title || "Experience"}
      >
        {selectedExperience && (
          <div className="prose prose-invert max-w-none">
            {selectedExperience.company && (
              <div className="mb-3">
                <span className="text-orange-400 font-semibold">Company: </span>
                <span className="text-gray-300">{selectedExperience.company}</span>
              </div>
            )}
            {(selectedExperience.startDate || selectedExperience.endDate) && (
              <div className="mb-3">
                <span className="text-orange-400 font-semibold">Period: </span>
                <span className="text-gray-300">
                  {selectedExperience.startDate || 'N/A'}
                  {selectedExperience.isCurrent ? ' - Present' : selectedExperience.endDate ? ` - ${selectedExperience.endDate}` : ''}
                </span>
              </div>
            )}
            {selectedExperience.location && (
              <div className="mb-4">
                <span className="text-orange-400 font-semibold">Location: </span>
                <span className="text-gray-300">{selectedExperience.location}</span>
              </div>
            )}
            <div className="mt-4">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {selectedExperience.description || 'No description available'}
              </p>
            </div>
          </div>
        )}
      </Dialog>

      {/* Skills Dialog */}
      <Dialog
        isOpen={skillsDialogOpen}
        onClose={() => setSkillsDialogOpen(false)}
        title="All Skills"
      >
        <div className="flex flex-wrap gap-2">
          {aboutData.skills && aboutData.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white text-xs font-medium rounded-full shadow-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </Dialog>
    </div>
  </section>
);
};

export default AboutSection;