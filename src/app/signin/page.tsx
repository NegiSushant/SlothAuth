import React, { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Sign In • SlothAuth Clinical Console",
  description: "Sign in to access your HIPAA-compliant Prior-Authorization Agentic Workspace.",
};

export default function SignInPage() {
  return (
    <AuthCard
      title="Access Clinical Operations"
      subtitle="Sign in to monitor autonomous overnight prior-authorization preparation"
      footerPrompt="Need a clinical workspace account?"
      footerLinkText="Create verified account"
      footerLinkHref="/signup"
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
