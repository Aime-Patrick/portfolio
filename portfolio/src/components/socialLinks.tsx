import React from "react";
import { IoLogoInstagram } from "react-icons/io5";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaSlack } from "react-icons/fa";
interface SocialLink {
  href: string;
  icon: React.ReactNode;
  label?: string;
}

interface SocialLinksProps {
  variant?: "home" | "contact";
}

const homeLinks: SocialLink[] = [
  {
    href: "https://www.instagram.com/",
    icon: <IoLogoInstagram />,
    label: "Instagram",
  },
  {
    href: "https://www.linkedin.com/in/ndagijimana-patrick-393ba5226",
    icon: <FaLinkedin />,
    label: "LinkedIn",
  },
  {
    href: "https://www.github.com/Aime-Patrick",
    icon: <FaGithub />,
    label: "GitHub",
  },
];

const contactLinks: SocialLink[] = [
  {
    href: "https://www.instagram.com/",
    icon: <IoLogoInstagram />,
    label: "Instagram",
  },
  {
    href: "https://www.slack.com/",
    icon: <FaSlack />,
    label: "Slack",
  },
  {
    href: "https://www.linkedin.com/in/ndagijimana-patrick-393ba5226",
    icon: <FaLinkedin />,
    label: "LinkedIn",
  },
];

const SocialLinks: React.FC<SocialLinksProps> = ({ variant = "home" }) => {
  const links = variant === "contact" ? contactLinks : homeLinks;
  const className =
    variant === "contact" ? "contact__social-link" : "home__social-link";
  return (
    <>
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          aria-label={link.label}
        >
          {link.icon}
        </a>
      ))}
    </>
  );
};

export default SocialLinks;