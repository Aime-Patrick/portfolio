"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoLogoInstagram } from "react-icons/io5";
import { FaLinkedin, FaGithub, FaArrowRight } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { CACHE_KEYS, readCache, writeCache } from "@/lib/clientCache";

type ProfileData = {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  heroPanelImages?: string[];
  socialLinks: { platform: string; url: string }[];
};

const defaultProfile: ProfileData = {
  name: "Aime Patrick NDAGIJIMANA",
  title: "Software Engineer",
  bio: "building scalable web apps with React, Node.js, NestJS, TypeScript, GraphQL, PostgreSQL, and MongoDB. Shipping reliable systems with Docker and CI/CD.",
  profileImage: "/hero-lcp.jpg",
  heroPanelImages: ["", "/hero-panel-2.jpg", "", ""],
  socialLinks: [
    { platform: "instagram", url: "https://www.instagram.com/" },
    {
      platform: "linkedin",
      url: "https://www.linkedin.com/in/ndagijimana-patrick-393ba5226",
    },
    { platform: "github", url: "https://www.github.com/AimePazzo" },
  ],
};

const normalizeProfile = (
  data: Partial<ProfileData> & Record<string, unknown>,
  fallback: ProfileData
): ProfileData => {
  const incomingBio =
    typeof data.bio === "string" ? data.bio.trim() : "";
  const weakBio =
    !incomingBio ||
    incomingBio.length < 40 ||
    /with knowledge in web development/i.test(incomingBio) ||
    /with expertise in web development and design/i.test(incomingBio) ||
    /many clients are happy/i.test(incomingBio);

  const rawImage = (data.profileImage as string) || fallback.profileImage;
  // Prefer web-optimized LCP asset over the 14MB studio original
  const profileImage =
    rawImage === "/_MAL0853.jpg" || rawImage.endsWith("/_MAL0853.jpg")
      ? "/hero-lcp.jpg"
      : rawImage;

  return {
    name: (data.name as string) || fallback.name,
    title: (data.title as string) || fallback.title,
    bio: weakBio ? fallback.bio : incomingBio,
    profileImage,
    heroPanelImages: Array.isArray(data.heroPanelImages)
      ? (data.heroPanelImages as string[])
      : fallback.heroPanelImages,
    socialLinks: Array.isArray(data.socialLinks)
      ? (data.socialLinks as ProfileData["socialLinks"])
      : fallback.socialLinks,
  };
};

/** Prefer high-quality Cloudinary delivery for hero portraits. */
const sharpenImageUrl = (url: string) => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  if (/\/upload\/[^/]*q_/.test(url)) return url;
  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto:best,w_1600,c_limit,dpr_auto/"
  );
};

const panelImageFor = (profile: ProfileData, index: number) => {
  const fromAdmin = profile.heroPanelImages?.[index]?.trim();
  if (fromAdmin) return sharpenImageUrl(fromAdmin);
  if (index === 1) return "/hero-panel-2.jpg";
  return sharpenImageUrl(profile.profileImage || "/hero-lcp.jpg");
};

const HomeSection: React.FC = () => {
  // Public site paints real defaults immediately (no skeleton).
  // Cache + Firebase only refine content in the background.
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
  const [activePanel, setActivePanel] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const stackRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const cached = readCache<ProfileData>(CACHE_KEYS.profile);
    if (cached) setProfileData(cached);
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [{ doc, getDoc }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("../firebase"),
        ]);
        const profileDoc = doc(db, "profile", "main");
        const profileSnapshot = await getDoc(profileDoc);
        if (profileSnapshot.exists()) {
          const next = normalizeProfile(
            profileSnapshot.data() as Partial<ProfileData> &
              Record<string, unknown>,
            defaultProfile
          );
          setProfileData(next);
          writeCache(CACHE_KEYS.profile, next);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const panels = panelRefs.current.filter(Boolean) as HTMLElement[];
    if (panels.length < 2) return;

    let cancelled = false;
    let ctx: gsap.Context | undefined;
    let mm: gsap.MatchMedia | undefined;

    const setup = async () => {
      const gsapMod = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const gsap = gsapMod.default;
      gsap.registerPlugin(ScrollTrigger);
      if (cancelled) return;

      mm = gsap.matchMedia();
      ctx = gsap.context(() => {
        // Desktop / tablet: pinned story panels
        mm!.add("(min-width: 768px)", () => {
          panels.forEach((panel, i) => {
            if (i === panels.length - 1) return;

            ScrollTrigger.create({
              trigger: panel,
              start: "top top",
              endTrigger: panels[panels.length - 1],
              end: "top top",
              pin: true,
              pinSpacing: false,
            });

            gsap.to(panel, {
              opacity: 0.35,
              ease: "none",
              scrollTrigger: {
                trigger: panels[i + 1],
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            });
          });
        });

        // All sizes: track active panel for image loading + dots
        panels.forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: panel,
            start: "top center",
            end: "bottom center",
            onEnter: () => setActivePanel(i),
            onEnterBack: () => setActivePanel(i),
          });
        });
      }, stackRef);

      if (cancelled) {
        ctx.revert();
        mm.revert();
      }
    };

    void setup();

    return () => {
      cancelled = true;
      ctx?.revert();
      mm?.revert();
    };
  }, [reduceMotion, profileData.profileImage]);

  const getSocialLink = (platform: string) => {
    const link = profileData.socialLinks?.find(
      (item) => item.platform.toLowerCase() === platform.toLowerCase()
    );
    return link?.url || "#";
  };

  const panels = [
    {
      id: "convert",
      image: panelImageFor(profileData, 0),
      eyebrow: "Available for projects",
      title: (
        <>
          I build products that turn visitors into customers.
        </>
      ),
      body: (
        <>
          <b className="hero-highlight">{profileData.title}</b>
          {", "}
          {profileData.bio}
        </>
      ),
      primary: { href: "#contact", label: "Start a project" },
      secondary: { href: "#project", label: "See my work" },
    },
    {
      id: "proof",
      image: panelImageFor(profileData, 1),
      eyebrow: "Proof",
      title: <>Shipped work with real teams.</>,
      body: (
        <>
          Full-stack delivery across React, Node.js, TypeScript, and Firebase 
          including apprenticeship and internship experience at{" "}
          <b className="hero-highlight">Andela</b>. Focused on clean UI, solid
          backends, and products people actually use.
        </>
      ),
      primary: { href: "#about", label: "About me" },
      secondary: { href: "#project", label: "View projects" },
    },
    {
      id: "offer",
      image: panelImageFor(profileData, 2),
      eyebrow: "What I offer",
      title: <>Web apps, AI agents, and reliable delivery.</>,
      body: (
        <>
          From marketing sites to AI-assisted workflows. I help startups and
          product teams move from idea to polished release without the fluff.
        </>
      ),
      primary: { href: "#services", label: "Explore services" },
      secondary: { href: "#contact", label: "Talk to me" },
    },
    {
      id: "next",
      image: panelImageFor(profileData, 3),
      eyebrow: "Next step",
      title: <>Let’s build something people remember.</>,
      body: (
        <>
          Tell me about your product, timeline, and goals. I’ll reply with a
          clear path: scope, approach, and how we can ship together.
        </>
      ),
      primary: { href: "#contact", label: "Contact me" },
      secondary: { href: "#project", label: "Browse projects" },
    },
  ];

  const socials = [
    { Icon: IoLogoInstagram, link: getSocialLink("instagram"), label: "Instagram" },
    { Icon: FaLinkedin, link: getSocialLink("linkedin"), label: "LinkedIn" },
    { Icon: FaGithub, link: getSocialLink("github"), label: "GitHub" },
  ];

  return (
    <section className="home relative" id="home" aria-label="Home section">
      {/* Progress dots — desktop side */}
      <div
        className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex"
        aria-hidden
      >
        {panels.map((panel, i) => (
          <span
            key={panel.id}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              activePanel === i
                ? "scale-125 bg-[var(--first-color)]"
                : "bg-white/25"
            }`}
          />
        ))}
      </div>

      {/* Progress dots — mobile bottom */}
      <div
        className="pointer-events-none fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] left-1/2 z-40 flex -translate-x-1/2 gap-2 md:hidden"
        aria-hidden
      >
        {panels.map((panel, i) => (
          <span
            key={`m-${panel.id}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activePanel === i
                ? "w-5 bg-[var(--first-color)]"
                : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>

      <div ref={stackRef} className="hero-stack relative">
        {panels.map((panel, i) => (
          <article
            key={panel.id}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={`hero-panel relative flex min-h-[100svh] items-center overflow-hidden bg-[var(--body-color)] ${
              reduceMotion ? "border-b border-[var(--border-color)]" : ""
            }`}
            style={{ zIndex: i + 1 }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse 55% 45% at 70% 45%, hsla(18,100%,48%,0.18), transparent 70%)",
              }}
            />

            <div className="container relative z-10 mx-auto grid w-full items-center gap-6 px-4 pt-24 pb-24 sm:gap-8 sm:pt-28 sm:pb-20 md:gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-20 lg:pt-32">
              <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--first-color)] sm:mb-3 sm:text-xs sm:tracking-[0.2em]">
                  {panel.eyebrow}
                </p>
                <h1 className="mb-3 font-bold leading-[1.1] text-[var(--title-color)] text-[1.65rem] sm:mb-4 sm:text-4xl sm:leading-[1.05] lg:text-5xl">
                  {i === 0 ? (
                    <>
                      <span className="mb-1.5 block text-base font-medium text-[var(--text-color)] sm:mb-2 sm:text-xl">
                        {profileData.name}
                      </span>
                      {panel.title}
                    </>
                  ) : (
                    panel.title
                  )}
                </h1>
                <p className="hero-panel__body mb-6 text-sm leading-relaxed text-[var(--title-color)] sm:mb-8 sm:text-base md:text-lg">
                  {panel.body}
                </p>

                <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
                  <a
                    href={panel.primary.href}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[var(--first-color)] to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:scale-[1.02] sm:px-6"
                  >
                    {panel.primary.label}
                    <FaArrowRight className="text-xs" />
                  </a>
                  <a
                    href={panel.secondary.href}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-color)] px-5 py-3 text-sm font-medium text-[var(--title-color)] transition hover:border-[var(--first-color)] hover:text-[var(--first-color)] sm:px-6"
                  >
                    {panel.secondary.label}
                  </a>
                </div>

                {i === 0 && (
                  <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4 lg:justify-start">
                    {socials.map(({ Icon, link, label }) => (
                      <a
                        key={label}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid place-items-center rounded-md bg-[var(--black-color-light)] p-2 text-xl text-[var(--text-color)] transition-all hover:-translate-y-1 hover:bg-[var(--surface-dark)] hover:text-[var(--first-color)] active:scale-90 sm:p-[6px] sm:text-2xl"
                        aria-label={label}
                      >
                        <Icon />
                      </a>
                    ))}
                  </div>
                )}

                {i === panels.length - 1 && (
                  <a
                    href="#about"
                    className="mt-8 inline-flex items-center gap-2 text-sm text-[var(--text-color)] transition hover:text-[var(--first-color)] sm:mt-10"
                    aria-label="Continue to About section"
                  >
                    <span className="grid h-9 w-9 place-items-center bg-[var(--surface-dark)] text-white transition hover:bg-[var(--first-color)]">
                      <IoIosArrowDown className="animate-bounce" />
                    </span>
                    Continue
                  </a>
                )}
              </div>

              {/* Portrait */}
              <div className="relative mx-auto w-[min(220px,70vw)] sm:w-[300px] md:w-[320px] lg:w-[400px]">
                <div className="relative">
                  <div className="relative z-10 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#222] sm:rounded-3xl">
                    {(i === 0 || i === activePanel || i === activePanel + 1) && (
                      <Image
                        src={panel.image}
                        alt={`${profileData.name} — ${panel.eyebrow}`}
                        fill
                        sizes="(max-width: 640px) 220px, (max-width: 1024px) 320px, 400px"
                        quality={85}
                        priority={i === 0}
                        loading={i === 0 ? "eager" : "lazy"}
                        className="object-cover object-[center_20%]"
                      />
                    )}
                  </div>
                  {/* Accent frame — desktop only (reads broken on narrow screens) */}
                  <div
                    className="pointer-events-none absolute top-3 -right-3 z-0 hidden h-full w-[72%] rounded-3xl border-4 border-[var(--first-color)] bg-[var(--container-color)] md:block lg:-right-2"
                    aria-hidden
                  />
                  {i === 0 && (
                    <>
                      <img
                        src="curved-arrow.svg"
                        alt=""
                        aria-hidden
                        className="absolute top-6 -right-1 z-20 hidden w-[48px] rotate-[80deg] sm:block sm:w-[70px] lg:-right-8"
                      />
                      <img
                        src="random-lines.svg"
                        alt=""
                        aria-hidden
                        className="absolute bottom-10 -left-1 z-20 hidden w-[48px] sm:block sm:w-[70px] lg:-left-8"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HomeSection;
