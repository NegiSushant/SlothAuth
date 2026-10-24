import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FlowWorkflowSection } from "@/components/landing/FlowWorkflowSection";
import { HackathonSpotlight } from "@/components/landing/HackathonSpotlight";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { LiveMetricsShowcase } from "@/components/landing/LiveMetricsShowcase";
import { TechStackBadgeSection } from "@/components/landing/TechStackBadgeSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "SlothAuth 🦥 • Autonomous Prior-Auth Prep Agent | Hackathon 2025",
  description:
    "Autonomous overnight prior-authorization preparation agent powered by local Gemma and PostgreSQL pgvector. 100% on-premise HIPAA compliant.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Global Navigation */}
      <LandingNavbar />

      {/* 2. Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Complete Project Flow & Architecture */}
        <FlowWorkflowSection />

        {/* Hackathon Problem & Solution Spotlight */}
        <HackathonSpotlight />

        {/* Engineering Capabilities & Features Grid */}
        <FeatureGrid />

        {/* Interactive Hospital ROI & Savings Calculator */}
        <LiveMetricsShowcase />

        {/* Technology Stack & Agent Framework Badges */}
        <TechStackBadgeSection />

        {/* Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* 3. Global Footer */}
      <LandingFooter />
    </div>
  );
}
