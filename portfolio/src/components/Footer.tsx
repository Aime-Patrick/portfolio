import React from "react";

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer__container container grid">
      <span className="footer__copy">
        &#169;All Rights Reserved By{" "}
        <a href="">Aime Patrick</a>
      </span>
      <ul className="footer__links">
        <li>
          <a href="#about" className="footer__link">About</a>
        </li>
        <li>
          <a href="#services" className="footer__link">Services</a>
        </li>
        <li>
          <a href="#project" className="footer__link">Projects</a>
        </li>
      </ul>
    </div>
  </footer>
);

export default Footer;