"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      terminalLogs={[
        "recovery.gateway.ready",
        "awaiting.email.input",
      ]}
    >
      <AuthCard
        badgeText="PASSWORD_RECOVERY"
        title="Reset your access key."
        subtitle="Enter your email and we will send a secure reset link to recover your workspace."
      >
        {success ? (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-[#7ee787]/10 border border-[#7ee787]/30 text-[#7ee787]">
              <span className="block text-[10px] uppercase font-bold tracking-wider mb-1 opacity-80">RESET_LINK_SENT</span>
              Check your inbox for the recovery link.
            </div>
            <Link href="/login" className="auth-primary-button flex items-center justify-center mt-4">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="auth-form-stack">
            <AuthInput
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="operator@example.com"
            />

            {error && (
              <div className="mt-2 text-sm text-red-500 font-mono">
                <span className="block text-[10px] uppercase font-bold tracking-wider mb-1 opacity-80">AUTH_ERROR</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-primary-button mt-4">
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Remember your password?{" "}
            <Link href="/login" className="text-white hover:text-[#7ee787] font-medium transition-colors">
              Sign in
            </Link>
          </div>
        )}
      </AuthCard>
      
      {/* Mobile Terminal Card */}
      <div className="auth-mobile-terminal mt-4 hidden">
        {">"} recovery.gateway.ready
      </div>
    </AuthShell>
  );
}
