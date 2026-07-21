"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaLinkedin,
  FaBriefcase,
  FaGraduationCap,
  FaInfoCircle,
} from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Dialog from "../components/Dialog";
import GithubActivity from "../components/GithubActivity";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

const BIO_SHORT =
  "I’m a Fullstack Software Engineer building scalable web apps with React, Node.js, NestJS, TypeScript, GraphQL, PostgreSQL, and MongoDB. Shipping reliable systems with Docker and CI/CD.";

const BIO_FULL =
  "I’m a Fullstack Software Engineer specializing in modern, scalable web applications. I work across React, Node.js, NestJS, GraphQL, Python, TypeScript, PostgreSQL, and MongoDB to design and deliver SaaS platforms and digital products for businesses and institutions. I also bring DevOps experience with Docker, CI/CD, and cloud deployments so what we ship stays fast and reliable.";

const DEFAULT_EXPERIENCES: Experience[] = [
  {
    id: "default-intern",
    title: "Full-Stack Developer Intern",
    company: "Andela",
    startDate: "Sept 2024",
    endDate: "Dec 2024",
    shortDescription:
      "Built and maintained production features with modern React and Node stacks, collaborating in agile teams on real client delivery.",
    description:
      "Contributed to full-stack features across the product lifecycle: from UI implementation to API integration and code review. Worked in collaborative squads, followed engineering standards, and helped ship reliable updates used by real users.",
  },
  {
    id: "default-apprentice",
    title: "Full-Stack Developer Apprenticeship",
    company: "Andela",
    startDate: "May 2024",
    endDate: "Aug 2024",
    shortDescription:
      "Hands-on apprenticeship building scalable web apps with TypeScript, React, and backend services under mentorship.",
    description:
      "Gained structured experience designing and shipping full-stack applications. Practiced clean component architecture, API design, testing habits, and team communication while delivering project milestones on schedule.",
  },
];

const truncateAtWord = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
};

const formatPeriod = (exp: Experience) => {
  if (!exp.startDate && !exp.endDate && !exp.isCurrent) return "";
  const start = exp.startDate || "N/A";
  if (exp.isCurrent) return `${start} – Present`;
  if (exp.endDate) return `${start} – ${exp.endDate}`;
  return start;
};

const AboutSection: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData>({
    name: "NDAGIJIMANA Aime Patrick",
    title: "Full Stack Developer",
    bio: BIO_SHORT,
    experience: DEFAULT_EXPERIENCES,
    education: "Computer Science: focused on software engineering and modern web systems.",
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Next.js",
      "Firebase",
      "MongoDB",
      "REST APIs",
      "Tailwind CSS",
      "AI Agents",
      "Git",
    ],
    image: "/IMG_2949.jpg",
  });
  const [profileData, setProfileData] = useState<{
    socialLinks?: { platform: string; url: string }[];
  }>({});
  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [allExperiencesDialogOpen, setAllExperiencesDialogOpen] =
    useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const perfilRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);

  const getExperiences = (): Experience[] => {
    if (Array.isArray(aboutData.experience) && aboutData.experience.length > 0) {
      return aboutData.experience;
    }
    if (typeof aboutData.experience === "string" && aboutData.experience.trim()) {
      return [
        {
          title: "Experience",
          description: aboutData.experience,
          shortDescription: truncateAtWord(aboutData.experience, 120),
        },
      ];
    }
    return DEFAULT_EXPERIENCES;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aboutDoc = doc(db, "about", "main");
        const aboutSnapshot = await getDoc(aboutDoc);
        if (aboutSnapshot.exists()) {
          const data = aboutSnapshot.data() as AboutData;
          const weakBio =
            !data.bio ||
            data.bio.length < 80 ||
            /many clients are happy/i.test(data.bio) ||
            /passionate about creating web pages/i.test(data.bio) ||
            /AI solutions and chatbots/i.test(data.bio) ||
            /intelligent digital solutions/i.test(data.bio);

          setAboutData({
            ...data,
            bio: weakBio ? BIO_SHORT : data.bio,
            experience:
              Array.isArray(data.experience) && data.experience.length > 0
                ? data.experience
                : typeof data.experience === "string" && data.experience.trim()
                  ? data.experience
                  : DEFAULT_EXPERIENCES,
            education: data.education?.trim()
              ? data.education
              : "Computer Science: focused on software engineering and modern web systems.",
            skills:
              data.skills?.length > 0
                ? data.skills
                : [
                    "React",
                    "TypeScript",
                    "Node.js",
                    "Next.js",
                    "Firebase",
                    "MongoDB",
                    "REST APIs",
                    "Tailwind CSS",
                    "AI Agents",
                    "Git",
                  ],
            image: data.image || "/IMG_2949.jpg",
          });
        }

        const profileDoc = doc(db, "profile", "main");
        const profileSnapshot = await getDoc(profileDoc);
        if (profileSnapshot.exists()) {
          setProfileData(profileSnapshot.data());
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      }
    };

    fetchData();
  }, []);

  // Pin image on desktop while about content scrolls; stagger reveals
  useEffect(() => {
    const section = sectionRef.current;
    const perfil = perfilRef.current;
    const info = infoRef.current;
    if (!section || !perfil || !info) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const revealItems = section.querySelectorAll<HTMLElement>(
        "[data-about-reveal]"
      );

      if (!reduceMotion) {
        revealItems.forEach((el, i) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              delay: i * 0.05,
              ease: "power3.out",
              overwrite: "auto",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );
        });

        if (imageWrapRef.current) {
          gsap.fromTo(
            imageWrapRef.current,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: imageWrapRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );
        }
      }

      // Pin portrait beside the long content column (desktop only)
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: perfil,
          start: "top 110px",
          endTrigger: info,
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });
      });
    }, section);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [aboutData]);

  const getLinkedinUrl = () => {
    const link = profileData.socialLinks?.find(
      (item) => item.platform.toLowerCase() === "linkedin"
    );
    return link?.url || "https://www.linkedin.com/";
  };

  const getGithubUrl = () => {
    const link = profileData.socialLinks?.find(
      (item) => item.platform.toLowerCase() === "github"
    );
    return link?.url || "https://github.com/Aime-Patrick";
  };

  const experiences = getExperiences();
  const isDefaultBio = aboutData.bio === BIO_SHORT;
  const bioPreview = isDefaultBio
    ? BIO_SHORT
    : truncateAtWord(aboutData.bio, 180);
  const bioFull = isDefaultBio ? BIO_FULL : aboutData.bio;
  const showBioMore = bioFull.length > bioPreview.length;

  return (
    <section
      ref={sectionRef}
      className="about section"
      id="about"
      aria-label="About section"
    >
      <div className="about__container container grid w-full">
        <h2
          className="section__title-1 text-3xl md:text-4xl lg:text-5xl mb-4"
          data-about-reveal
        >
          <span>About Me</span>
        </h2>

        <div className="about__perfil" ref={perfilRef}>
          <div className="about__image" ref={imageWrapRef}>
            <img
              src={aboutData.image || "/IMG_2949.jpg"}
              alt={`${aboutData.name} portrait`}
              className="about__img"
              loading="lazy"
              decoding="async"
            />
            <div className="about__shadow"></div>
            <div className="geomatric-box"></div>
            <img
              src="/random-lines.svg"
              alt=""
              aria-hidden
              className="about__line"
            />
            <div className="about__box"></div>
          </div>
        </div>

        <div className="about__info" ref={infoRef}>
          <p
            className="about-accent mb-2 text-sm font-semibold uppercase tracking-[0.18em]"
            data-about-reveal
          >
            {aboutData.title || "Full Stack Developer"}
          </p>

          <div className="relative mb-8" data-about-reveal>
            <p className="text-[var(--title-color)] text-lg md:text-xl font-medium leading-relaxed">
              {bioPreview}
            </p>
            {showBioMore && (
              <button
                onClick={() => setBioDialogOpen(true)}
                className="about-accent mt-3 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              >
                <FaInfoCircle className="text-xs" />
                Read full story
              </button>
            )}
          </div>

          {experiences.length > 0 && (
            <div className="mb-8" data-about-reveal>
              <div className="mb-2 flex items-center gap-2">
                <FaBriefcase className="about-accent text-lg" />
                <h3 className="font-bold text-[var(--title-color)] text-xl">
                  Experience
                </h3>
              </div>
              <p className="mb-4 text-sm text-[var(--text-color)]">
                Roles where I shipped features, learned under pressure, and
                delivered with a team.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiences.slice(0, 2).map((exp, index) => (
                  <button
                    key={exp.id || index}
                    onClick={() => {
                      setSelectedExperience(exp);
                      setExperienceDialogOpen(true);
                    }}
                    className="group relative p-4 rounded-lg border border-[var(--border-color)] bg-[var(--body-color)] text-left transition-colors hover:border-[hsl(18,100%,48%)]"
                    aria-label={`View ${exp.title || "experience"} details`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-[var(--title-color)] text-lg transition-colors group-hover:text-[hsl(18,100%,48%)]">
                          {exp.title || "Untitled Experience"}
                        </h4>
                        <FaInfoCircle className="about-accent mt-1 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      {exp.company && (
                        <p className="about-accent text-sm font-medium">
                          {exp.company}
                        </p>
                      )}
                      {formatPeriod(exp) && (
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatPeriod(exp)}
                        </p>
                      )}
                      <p className="mt-1 text-sm leading-relaxed text-[var(--text-color)] line-clamp-3">
                        {exp.shortDescription ||
                          truncateAtWord(exp.description || "", 130) ||
                          "No description available"}
                      </p>
                      <span className="about-accent mt-2 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                        View details →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {experiences.length > 2 && (
                <button
                  onClick={() => setAllExperiencesDialogOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] px-5 py-2.5 text-sm font-medium text-[var(--title-color)] transition-colors hover:border-[hsl(18,100%,48%)] hover:text-[hsl(18,100%,48%)]"
                  aria-label="View all experiences"
                >
                  View all experience
                </button>
              )}
            </div>
          )}

          <div
            className="mb-6 rounded-lg border border-[var(--border-color)] bg-[var(--body-color)] p-4 transition-colors hover:border-[hsl(18,100%,48%)]"
            data-about-reveal
          >
            <div className="mb-2 flex items-center gap-2">
              <FaGraduationCap className="about-accent text-lg" />
              <h3 className="font-bold text-[var(--title-color)]">Education</h3>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-color)]">
              {aboutData.education}
            </p>
          </div>

          {aboutData.skills && aboutData.skills.length > 0 && (
            <div className="mb-8" data-about-reveal>
              <h3 className="mb-2 font-bold text-[var(--title-color)]">
                Skills
              </h3>
              <p className="mb-3 text-sm text-[var(--text-color)]">
                Tools I use to design, build, and ship.
              </p>
              <div className="mb-3 flex max-h-[120px] flex-wrap gap-2 overflow-hidden">
                {aboutData.skills.slice(0, 12).map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-[var(--border-color)] bg-[var(--container-color)] px-3 py-1.5 text-xs font-medium text-[var(--title-color)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {aboutData.skills.length > 12 && (
                <button
                  onClick={() => setSkillsDialogOpen(true)}
                  className="about-accent inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  aria-label="View all skills"
                >
                  View all skills
                </button>
              )}
            </div>
          )}

          <GithubActivity profileUrl={getGithubUrl()} />

          <div className="about__buttons" data-about-reveal>
            <a
              href="#contact"
              className="button"
              aria-label="Contact Aime Patrick Ndagijimana"
            >
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

        <Dialog
          isOpen={bioDialogOpen}
          onClose={() => setBioDialogOpen(false)}
          title="About Me"
        >
          <div className="space-y-4">
            <p className="about-accent text-sm font-semibold uppercase tracking-[0.16em]">
              {aboutData.title}
            </p>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--text-color)]">
              {bioFull}
            </p>
          </div>
        </Dialog>

        <Dialog
          isOpen={allExperiencesDialogOpen}
          onClose={() => setAllExperiencesDialogOpen(false)}
          title="Experience"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {experiences.map((exp, index) => (
              <button
                key={exp.id || index}
                onClick={() => {
                  setSelectedExperience(exp);
                  setAllExperiencesDialogOpen(false);
                  setExperienceDialogOpen(true);
                }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--body-color)] p-4 text-left transition-colors hover:border-[hsl(18,100%,48%)]"
              >
                <h4 className="font-bold text-[var(--title-color)]">
                  {exp.title || "Untitled Experience"}
                </h4>
                {exp.company && (
                  <p className="about-accent mt-1 text-sm">
                    {exp.company}
                  </p>
                )}
                {formatPeriod(exp) && (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {formatPeriod(exp)}
                  </p>
                )}
                <p className="mt-2 line-clamp-3 text-sm text-[var(--text-color)]">
                  {exp.shortDescription ||
                    truncateAtWord(exp.description || "", 120)}
                </p>
              </button>
            ))}
          </div>
        </Dialog>

        <Dialog
          isOpen={experienceDialogOpen}
          onClose={() => {
            setExperienceDialogOpen(false);
            setSelectedExperience(null);
          }}
          title={selectedExperience?.title || "Experience"}
        >
          {selectedExperience && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm">
                {selectedExperience.company && (
                  <span className="rounded-full border border-[var(--border-color)] px-3 py-1 text-[var(--title-color)]">
                    {selectedExperience.company}
                  </span>
                )}
                {formatPeriod(selectedExperience) && (
                  <span className="rounded-full border border-[var(--border-color)] px-3 py-1 text-[var(--text-color)]">
                    {formatPeriod(selectedExperience)}
                  </span>
                )}
                {selectedExperience.location && (
                  <span className="rounded-full border border-[var(--border-color)] px-3 py-1 text-[var(--text-color)]">
                    {selectedExperience.location}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--text-color)]">
                {selectedExperience.description || "No description available"}
              </p>
            </div>
          )}
        </Dialog>

        <Dialog
          isOpen={skillsDialogOpen}
          onClose={() => setSkillsDialogOpen(false)}
          title="Skills"
        >
          <div className="flex flex-wrap gap-2">
            {aboutData.skills?.map((skill, index) => (
              <span
                key={index}
                className="rounded-full border border-[var(--border-color)] bg-[var(--body-color)] px-3 py-1.5 text-xs font-medium text-[var(--title-color)]"
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
