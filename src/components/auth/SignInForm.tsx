"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await signIn({ email, password });
    setIsSubmitting(false);

    if (res.success) {
      router.push(redirectPath);
      router.refresh();
    } else {
      setErrorMsg(res.error || "Failed to sign in. Please check your credentials.");
    }
  };

  // Demo accounts helper
  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setErrorMsg(null);
  };

  return (
    <div className="space-y-5">
      {/* Quick Demo Fill Pills for Hackathon Judges */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Demo Access (1-Click Test)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount("dr.chen@slothauth.health")}
            className="text-left p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-emerald-500/40 transition-all text-xs group"
          >
            <p className="font-semibold text-slate-200 group-hover:text-emerald-400">Dr. Sarah Chen</p>
            <p className="text-[10px] text-slate-400">CMO / Clinician</p>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("admin@slothauth.health")}
            className="text-left p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-teal-500/40 transition-all text-xs group"
          >
            <p className="font-semibold text-slate-200 group-hover:text-teal-400">Marcus Vance</p>
            <p className="text-[10px] text-slate-400">Prior-Auth Director</p>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Clinical Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. physician@hospital.org"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating Session...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign In to Protected Dashboard</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
