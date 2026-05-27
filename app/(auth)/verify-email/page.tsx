"use client";

import React from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifyEmailPage() {
  return (
    <AuthShell
      terminalLogs={[
        "workspace.staged",
        "awaiting.verification",
      ]}
    >
      <AuthCard
        badgeText="VERIFICATION_REQUIRED"
        title="Check your inbox."
        subtitle="We've sent a secure verification link to your email address. Please click the link to activate your workspace."
      >
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="p-5 rounded-xl bg-[#0b0d10] border border-gray-800 text-gray-300 text-sm text-center">
            If you don't see the email within a few minutes, check your spam folder or junk mail.
          </div>
          <Link href="/login" className="auth-primary-button flex items-center justify-center mt-4">
            Return to Sign In
          </Link>
        </div>
      </AuthCard>
      
      <div className="auth-mobile-terminal mt-4 hidden">
        {">"} awaiting.verification
      </div>
    </AuthShell>
  );
}
