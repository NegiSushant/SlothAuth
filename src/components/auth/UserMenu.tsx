"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { LogOut, User, Shield, ChevronDown, LayoutDashboard } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/signin"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-4 py-1.5 rounded-lg shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    CHIEF_MEDICAL_OFFICER: "Chief Medical Officer",
    ATTENDING_PHYSICIAN: "Attending Physician",
    PRIOR_AUTH_DIRECTOR: "Prior-Auth Director",
    CLINICAL_SPECIALIST: "Clinical Specialist",
    HEALTH_ADMIN: "Health Admin",
  };

  const displayRole = roleLabels[user.role] || user.role;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
          {user.name.charAt(0)}
        </div>
        <div className="hidden sm:block text-xs">
          <p className="font-semibold text-slate-200 truncate max-w-[140px]">
            {user.name}
          </p>
          <p className="text-[10px] text-emerald-400 font-medium truncate max-w-[140px]">
            {displayRole}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl shadow-black/80 z-50">
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
            <p className="text-xs font-semibold text-white">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-300">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="truncate">{user.organization}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              Prior-Auth Dashboard
            </Link>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <User className="w-3.5 h-3.5 text-teal-400" />
              Project Flow & Overview
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors mt-1 border-t border-slate-800/60 pt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
