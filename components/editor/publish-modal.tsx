"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Globe, Link2, AlertCircle } from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  isPublished: boolean;
  publicSlug: string | null;
  onPublishSuccess: (slug: string) => void;
  onUnpublishSuccess: () => void;
}

const MONO_FONT = "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace";

export function PublishModal({
  isOpen,
  onOpenChange,
  resumeId,
  isPublished,
  publicSlug,
  onPublishSuccess,
  onUnpublishSuccess,
}: PublishModalProps) {
  const [slug, setSlug] = useState(publicSlug || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePublish = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/resumes/${resumeId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish");
      }

      onPublishSuccess(slug);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/resumes/${resumeId}/unpublish`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to unpublish");
      }

      onUnpublishSuccess();
      setSlug("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicSlug) return;
    const url = `${window.location.origin}/r/${publicSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#040506] border border-[rgba(255,255,255,0.08)] text-[#f3f3f3]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Globe size={18} className="text-[#e7c59a]" />
            {isPublished ? "Manage Publication" : "Publish to Web"}
          </DialogTitle>
          <DialogDescription className="text-[#9c9c9d]">
            {isPublished
              ? "Your resume is live and accessible via the public link."
              : "Make your resume accessible via a public URL. (Requires Pro/Lifetime plan)"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgba(255,99,99,0.1)] border border-[rgba(255,99,99,0.2)] text-[#ff8c8c] text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isPublished ? (
            // Published State
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#6a6b6c]" style={{ fontFamily: MONO_FONT }}>
                  Public URL
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
                  <span className="flex-1 truncate text-sm text-[#56c2ff]" style={{ fontFamily: MONO_FONT }}>
                    kvinnresume.com/r/{publicSlug}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111214] border border-[rgba(255,255,255,0.1)] text-xs text-[#f3f3f3] hover:bg-[#1b1c1e] transition-colors"
                  >
                    <Link2 size={12} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex justify-end">
                <button
                  onClick={handleUnpublish}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg text-sm text-[#ff8c8c] border border-[rgba(255,99,99,0.2)] hover:bg-[rgba(255,99,99,0.05)] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Unpublishing..." : "Unpublish Resume"}
                </button>
              </div>
            </div>
          ) : (
            // Unpublished State
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-[#6a6b6c]" style={{ fontFamily: MONO_FONT }}>
                  URL Slug
                </label>
                <div className="flex items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[rgba(231,197,154,0.5)]">
                  <span className="px-3 text-sm text-[#6a6b6c] select-none" style={{ fontFamily: MONO_FONT }}>
                    /r/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="john-doe"
                    className="flex-1 h-10 bg-transparent text-sm text-[#f3f3f3] outline-none"
                    style={{ fontFamily: MONO_FONT }}
                  />
                </div>
                <p className="text-xs text-[#6a6b6c] mt-1">
                  Only lowercase letters, numbers, and hyphens (3-60 chars).
                </p>
              </div>

              <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex justify-end gap-3">
                <button
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 rounded-lg text-sm text-[#9c9c9d] hover:text-[#f3f3f3] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isLoading || slug.length < 3}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#e6e6e6] text-[#2f3031] hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Publishing..." : "Publish Resume"}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
