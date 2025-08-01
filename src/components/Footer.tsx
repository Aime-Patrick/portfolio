import React from "react";
import { useSiteSettings } from "./SiteSettingsProvider";

const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  
  return (
  <footer className="footer">
    <div className="footer__container !container !grid">
      <span className="footer__copy">
        {settings.footerText || "© 2023 Aime Patrick Ndagijimana. All rights reserved."}
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
};

export default Footer;