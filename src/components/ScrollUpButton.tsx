import React, { useEffect, useState } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";
const ScrollUpButton: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY >= 350);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <a
      href="#"
      className={`scrollup${show ? " show-scroll" : ""}`}
      id="scroll-up"
      onClick={handleClick}
      aria-label="Scroll to top"
    >
        <MdKeyboardArrowUp className="scrollup__icon" />
    </a>
  );
};

export default ScrollUpButton;