"use client";

import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--container-color)] shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--title-color)] sm:text-2xl">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-color)] transition-colors hover:bg-[var(--body-color)] hover:text-[var(--title-color)]"
            aria-label="Close dialog"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
