"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <AuthShell
      terminalLogs={[
        "session.recovered",
        "awaiting.new.key",
      ]}
    >
      <AuthCard
        badgeText="NEW_KEY_ENTRY"
        title="Set new password."
        subtitle="Enter a strong new password to secure your workspace."
      >
        <form onSubmit={handleUpdate} className="auth-form-stack">
          <AuthInput
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••••••"
          />

          <div className="mt-[-6px]">
            <PasswordStrengthMeter password={password} />
          </div>

          <AuthInput
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••••••"
          />

          {error && (
            <div className="mt-2 text-sm text-red-500 font-mono">
              <span className="block text-[10px] uppercase font-bold tracking-wider mb-1 opacity-80">AUTH_ERROR</span>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-primary-button mt-4">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </AuthCard>
      
      <div className="auth-mobile-terminal mt-4 hidden">
        {">"} awaiting.new.key
      </div>
    </AuthShell>
  );
}
