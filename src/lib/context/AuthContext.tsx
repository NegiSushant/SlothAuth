"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, SignInCredentials, SignUpCredentials } from "../auth/types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<{ success: boolean; error?: string }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const signIn = async (credentials: SignInCredentials) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to sign in." };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error during sign-in.",
      };
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to create account." };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error during sign-up.",
      };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      router.push("/signin");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refresh: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
