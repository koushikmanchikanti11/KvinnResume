"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { signInWithOAuth } from "@/lib/supabase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
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
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-6">Sign in to your account</p>

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
            OR USE EMAIL
          </span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
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

          <div className="flex items-center justify-between text-sm mt-1">
            <label className="flex items-center gap-2 text-gray-400">
              <input type="checkbox" className="rounded border-gray-600 bg-black text-[#7ee787]" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-gray-400 hover:text-white">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={isAnyLoading} className="w-full bg-white text-black font-bold rounded p-3 mt-4 hover:bg-gray-200 transition">
            {loading ? "Authenticating..." : "Enter Workspace"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          New to KvinnResume?{" "}
          <Link href="/register" className="text-white hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
