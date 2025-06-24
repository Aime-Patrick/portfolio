import React, { useState, useEffect } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [shadow, setShadow] = useState(false);

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setShadow(window.scrollY >= 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on nav link click (mobile)
  const handleNavLinkClick = () => setShowMenu(false);

  return (
    <header className={`header ${shadow ? " shadow-header" : ""}`} id="header">
      <nav className="flex items-center justify-between">
        <a href="/" className="flex items-center">
          <span className="nav__logo_circle">P</span>
          <span className="nav__logo_name">CodeWithPatrick.</span>
        </a>
        <div className={`nav__menu${showMenu ? " show-menu" : ""}`} id="nav-menu">
          <span className="nav__title">Menu</span>
          <h3 className="nav__name">Patrick</h3>
          <ul className="nav__list">
            <li className="nav__item">
              <a href="#home" className="nav__link active-link" onClick={handleNavLinkClick}>
                Home
              </a>
            </li>
            <li className="nav__item">
              <a href="#about" className="nav__link" onClick={handleNavLinkClick}>
                About ME
              </a>
            </li>
            <li className="nav__item">
              <a href="#services" className="nav__link" onClick={handleNavLinkClick}>
                Services
              </a>
            </li>
            <li className="nav__item">
              <a href="#project" className="nav__link" onClick={handleNavLinkClick}>
                Projects
              </a>
            </li>
            <li className="nav__item">
              <a
                href="#contact"
                className="nav__link nav__link-button"
                onClick={handleNavLinkClick}
              >
                Contact Me
              </a>
            </li>
          </ul>
          <div className="nav__close" id="nav-close" onClick={() => setShowMenu(false)}>
            <IoClose className="nav__close-icon" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme toggle will be a separate component */}
            <ThemeToggle />
          {/* Toggle button */}
          <div className="nav__toggle" id="nav-toggle" onClick={() => setShowMenu(true)}>
            <IoMenu />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;