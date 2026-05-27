"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { signInWithOAuth } from "@/lib/supabase/auth";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/verify-email");
    }
  };

  const handleOAuth = async (provider: "google" | "github" | "discord") => {
    try {
      setOauthLoading(provider);
      await signInWithOAuth(provider);
    } catch (err: any) {
      setError(err.message || "Failed to connect to provider.");
      setOauthLoading(null);
    }
  };

  const isAnyLoading = loading || oauthLoading !== null;

  return (
    <div className="min-h-screen bg-[#050607] flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-[#0b0d10] border border-gray-800 rounded-xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Create an account</h1>
        <p className="text-gray-400 text-sm mb-6">Start building your resume OS.</p>

        <div className="flex flex-col gap-3">
          <OAuthButton
            provider="Google"
            onClick={() => handleOAuth("google")}
            isLoading={oauthLoading === "google"}
            disabled={isAnyLoading}
          />
          <OAuthButton
            provider="GitHub"
            onClick={() => handleOAuth("github")}
            isLoading={oauthLoading === "github"}
            disabled={isAnyLoading}
          />
          <OAuthButton
            provider="Discord"
            onClick={() => handleOAuth("discord")}
            isLoading={oauthLoading === "discord"}
            disabled={isAnyLoading}
          />
        </div>

        <div className="flex items-center gap-4 my-6 opacity-50">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
            OR CREATE WITH EMAIL
          </span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isAnyLoading}
              className="w-full bg-[#11141a] border border-gray-700 rounded p-2 text-white outline-none focus:border-[#7ee787]"
              placeholder="Kiran Koushik"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAnyLoading}
              className="w-full bg-[#11141a] border border-gray-700 rounded p-2 text-white outline-none focus:border-[#7ee787]"
              placeholder="operator@example.com"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAnyLoading}
              className="w-full bg-[#11141a] border border-gray-700 rounded p-2 text-white outline-none focus:border-[#7ee787]"
              placeholder="••••••••••••"
            />
          </div>

          <PasswordStrengthMeter password={password} />

          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isAnyLoading}
              className="w-full bg-[#11141a] border border-gray-700 rounded p-2 text-white outline-none focus:border-[#7ee787]"
              placeholder="••••••••••••"
            />
          </div>

          <div className="text-sm mt-1">
            <label className="flex items-center gap-2 text-gray-400">
              <input 
                type="checkbox" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isAnyLoading}
                className="rounded border-gray-600 bg-black text-[#7ee787]" 
              />
              I agree to Terms and Privacy Policy
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={isAnyLoading} className="w-full bg-white text-black font-bold rounded p-3 mt-4 hover:bg-gray-200 transition">
            {loading ? "Creating Workspace..." : "Create Workspace"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
