import React from "react";
import { IoLogoInstagram } from "react-icons/io5";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
const HomeSection: React.FC = () => (
  <section className="home section" id="home" aria-label="Home section">
    <div className="home__container container grid">
      <h1 className="home__name">Aime Patrick Ndagijimana</h1>
      <div className="home__perfil">
        <div className="home__image">
          <img src="/_MAL0853.jpg" alt="Aime Patrick Ndagijimana portrait" className="home__img" />
          <div className="home__shadow"></div>
          <img
            src="curved-arrow.svg"
            alt="Curved arrow graphic"
            className="home__arrow"
          />
          <img
            src="random-lines.svg"
            alt="Decorative random lines"
            className="home__line"
          />
          <div className="geomatric-box"></div>
        </div>
        <div className="home__social">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="home__social-link"
            aria-label="Instagram"
          >
            <IoLogoInstagram />
          </a>
          <a
            href="https://www.linkedin.com/in/ndagijimana-patrick-393ba5226"
            target="_blank"
            rel="noopener noreferrer"
            className="home__social-link"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.github.com/AimePazzo"
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
          <b>Software Engineer</b>, with knowledge in web development and
          design, I offer the best projects resulting in quality work.
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

export default HomeSection;