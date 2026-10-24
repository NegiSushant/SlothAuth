"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { ShieldCheck, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";

export function LandingNavbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/50 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            🦥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Sloth<span className="text-emerald-400">Auth</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Hackathon 2025
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Autonomous Prior-Auth Preparation
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <a href="#workflow" className="hover:text-emerald-400 transition-colors">
            Agent Workflow
          </a>
          <a href="#hackathon" className="hover:text-emerald-400 transition-colors">
            Hackathon Mission
          </a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Key Features
          </a>
          <a href="#calculator" className="hover:text-emerald-400 transition-colors">
            Savings Impact
          </a>
          <a href="#faq" className="hover:text-emerald-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Desktop Auth CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-950" />
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-2 text-sm text-slate-300 font-medium">
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-emerald-400"
            >
              Agent Workflow
            </a>
            <a
              href="#hackathon"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-emerald-400"
            >
              Hackathon Mission
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-emerald-400"
            >
              Key Features
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-emerald-400"
            >
              Savings Impact
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-emerald-400"
            >
              FAQ
            </a>
          </nav>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-xl"
              >
                Launch Console
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl"
                >
                  Create Clinical Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
