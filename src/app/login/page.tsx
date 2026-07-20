"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/login-form";

const LOGIN_BG = "#F5F5F5";

function useLoginBackground() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlScheme = html.style.colorScheme;
    const prevBodyBg = body.style.backgroundColor;
    const prevBodyColor = body.style.color;

    html.style.colorScheme = "light";
    body.style.setProperty("background-color", LOGIN_BG, "important");
    body.style.setProperty("color", "#171717", "important");

    return () => {
      html.style.colorScheme = prevHtmlScheme;
      body.style.setProperty("background-color", prevBodyBg || "", "important");
      body.style.setProperty("color", prevBodyColor || "", "important");
    };
  }, []);
}

function LoginFallback() {
  useLoginBackground();
  return (
    <div
      className="admin-shell flex min-h-svh items-center justify-center"
      style={{ backgroundColor: LOGIN_BG }}
    >
      <div
        className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-label="Loading"
      />
    </div>
  );
}

function LoginContent() {
  useLoginBackground();

  return (
    <div
      className="admin-shell flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      style={{ backgroundColor: LOGIN_BG }}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium text-foreground"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Admin
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
