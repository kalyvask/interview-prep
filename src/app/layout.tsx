import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "AI PM Interview Prep",
  description:
    "Reference and drill surface for AI PM interviews. 7 rounds, the DASME framework, a 64-question system-design bank, paired calibration answers, company playbooks, and a personalized mock interview at /interview that runs CV + JD through Claude with prompt caching.",
  metadataBase: new URL("https://interview-prep.vercel.app"),
  openGraph: {
    title: "AI PM Interview Prep",
    description:
      "DASME, the 64-question bank, calibration answers, company playbooks, and a personalized mock interview that grades you against real paired examples.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
