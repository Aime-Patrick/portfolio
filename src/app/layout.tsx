import type { Metadata } from "next";
import { Playpen_Sans } from "next/font/google";
import { Providers } from "./providers";
import DeferredAnalytics from "@/components/DeferredAnalytics";
import "./globals.css";

const playpen = Playpen_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-playpen",
});

export const metadata: Metadata = {
  title:
    "Aime Patrick Ndagijimana - Full Stack Developer | React, Node.js, AI Solutions Engineer Rwanda",
  description:
    "Hire Aime Patrick (NDAGIJIMANA), an expert Full Stack Developer in Kigali, Rwanda with 6+ years experience. Specializing in React, Node.js, TypeScript, Firebase, and modern web development.",
  keywords: [
    "Full Stack Developer Rwanda",
    "Software Engineer Kigali",
    "React Developer",
    "Node.js Developer",
    "Aime Patrick Ndagijimana",
  ],
  authors: [{ name: "Aime Patrick Ndagijimana" }],
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Aime Patrick Ndagijimana - Full Stack Developer",
    description:
      "Expert Full Stack Developer in Rwanda with 6+ years experience. Specializing in React, Node.js, TypeScript, and Firebase.",
    url: "https://portfolio-three-navy-77.vercel.app/",
    siteName: "Aime Patrick Ndagijimana Portfolio",
    images: [
      {
        url: "https://portfolio-three-navy-77.vercel.app/hero-lcp.jpg",
        width: 1200,
        height: 1500,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#ff5722",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${playpen.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preload optimized LCP portrait for first paint */}
        <link
          rel="preload"
          as="image"
          href="/hero-lcp.jpg"
          type="image/jpeg"
          fetchPriority="high"
        />
      </head>
      <body
        className={`${playpen.className} min-h-svh antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <DeferredAnalytics />
      </body>
    </html>
  );
}
