import React, { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Create Clinical Account • SlothAuth",
  description: "Register your healthcare organization to deploy autonomous prior-auth workflows.",
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create Clinical Account"
      subtitle="Register your credentials to inspect and approve agentic prior-auth packets"
      footerPrompt="Already have an active account?"
      footerLinkText="Sign in to console"
      footerLinkHref="/signin"
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </AuthCard>
  );
}
