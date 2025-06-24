import React from "react";
import { FaLinkedin } from "react-icons/fa";

const AboutSection: React.FC = () => (
  <section className="about section" id="about">
    <div className="about__container container grid">
      <h2 className="section__title-1">
        <span>About Me.</span>
      </h2>
      <div className="about__perfil">
        <div className="about__image">
          <img
            src="/IMG_2949.jpg"
            alt="image"
            className="about__img"
          />
          <div className="about__shadow"></div>
          <div className="geomatric-box"></div>
          <img
            src="/random-lines.svg"
            alt="line"
            className="about__line"
          />
          <div className="about__box"></div>
        </div>
      </div>
      <div className="about__info">
        <p className="about__description">
          Passionate about creating <b>Web Pages</b> with
          <b> UI/UX User Interface</b>, I have years of experience and many
          clients are happy with the projects carried out.
        </p>
        <ul className="about__list">
          <li className="about__item">
            <b>Frontend Skills:</b> HTML, CSS & SCSS, JavaScript, React, React Native, Bootstrap, Tailwind, Figma, TypeScript
          </li>
          <li className="about__item">
            <b>Backend Skills:</b> Node.js, MongoDB, PostgreSQL, MySQL, REST APIs
          </li>
        </ul>
        <div className="about__buttons">
          <a href="#contact" className="button">
            <i className="ri-send-plane-line"></i>
            Contact Me
          </a>
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="button__ghost"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;