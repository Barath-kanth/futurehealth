import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Naskh_Arabic } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const arabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SeedShield — Male Vitality & Legacy Guardian",
  description:
    "Consent-based, private early-check for male reproductive health screening — you control what is shared. Built for the Gulf context. Screening ≠ diagnosis.",
};

/** Client-state app (Zustand + age gate) — allow blocking navigations. */
export const instant = false;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${arabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
