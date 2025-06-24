import React, { useEffect, useState } from "react";
import { IoIosMoon } from "react-icons/io";
import { MdOutlineLightMode } from "react-icons/md";

const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const selectedTheme = localStorage.getItem("selected-theme");
    if (selectedTheme === "dark") {
      document.body.classList.add("dark-theme");
      setDark(true);
    } else {
      document.body.classList.remove("dark-theme");
      setDark(false);
    }
  }, []);

  const handleToggle = () => {
    if (dark) {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("selected-theme", "light");
      setDark(false);
    } else {
      document.body.classList.add("dark-theme");
      localStorage.setItem("selected-theme", "dark");
      setDark(true);
    }
  };

  return (
    <button
      id="theme-button"
      onClick={handleToggle}
      style={{ cursor: "pointer", background: "none", border: "none" }}
      aria-label="Toggle dark mode"
      tabIndex={0}
      type="button"
    >
      {dark ? (
        <MdOutlineLightMode size={24} className="change-theme" />
      ) : (
        <IoIosMoon size={24} className="change-theme" />
      )}
    </button>
  );
};

export default ThemeToggle;