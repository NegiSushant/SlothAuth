import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SlothAuth 🦥 • Autonomous Prior-Auth Prep Agent",
  description:
    "Autonomous overnight prior-authorization preparation agent powered by local Gemma and PostgreSQL pgvector. 100% on-premise HIPAA compliant.",
};

import { AuthProvider } from "@/lib/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark bg-slate-950 text-slate-100 antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
