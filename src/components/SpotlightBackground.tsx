import React, { useRef, useEffect } from "react";

interface SpotlightBackgroundProps {
  children: React.ReactNode;
}

const SpotlightBackground: React.FC<SpotlightBackgroundProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        containerRef.current.style.setProperty("--x", `${x}px`);
        containerRef.current.style.setProperty("--y", `${y}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen transition-colors duration-500 ease-in-out"
      style={{
        // Default positions to center if mouse hasn't moved yet
        ["--x" as any]: "50%",
        ["--y" as any]: "50%",
      }}
    >
      {/* The Glow Overlay - Fixed position to follow scroll properly */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-300 z-0"
        style={{
          background: `radial-gradient(
            600px circle at var(--x) var(--y), 
            rgba(244, 74, 0, 0.15), 
            transparent 40%
          )`,
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full">
          {children}
      </div>
    </div>
  );
};

export default SpotlightBackground;
