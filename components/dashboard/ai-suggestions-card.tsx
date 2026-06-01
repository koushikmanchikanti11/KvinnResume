"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ChevronRight } from "lucide-react";

interface AISuggestionsCardProps {
  userId: string;
  onSuggestionClick: (prompt: string) => void;
}

interface Suggestion {
  label: string;
  prompt: string;
}

interface ResumeJson {
  basics?: {
    summary?: string | null;
  };
  work?: Array<{
    highlights?: string[] | null;
  }> | null;
  experience?: Array<{
    highlights?: string[] | null;
    bullets?: string[] | null;
  }> | null;
}

interface ResumeRow {
  id: string;
  ats_score: number | null;
  resume_json: ResumeJson | null;
}

const fallbackSuggestions: Suggestion[] = [
  {
    label: "Improve summary for frontend roles",
    prompt: "Improve summary for frontend roles",
  },
  {
    label: "Add metrics to project bullets",
    prompt: "Add metrics to project bullets",
  },
  {
    label: "Optimize skills section for ATS",
    prompt: "Optimize skills section for ATS",
  },
  {
    label: "Create cover letter from resume",
    prompt: "Create cover letter from resume",
  },
];

function deriveSuggestions(resume: ResumeRow | null): Suggestion[] {
  if (!resume || !resume.resume_json) {
    return fallbackSuggestions;
  }

  const suggestions: Suggestion[] = [];
  const resumeJson = resume.resume_json;

  if (resume.ats_score === null || resume.ats_score < 80) {
    suggestions.push({
      label: "Optimize resume for ATS scoring",
      prompt:
        "Review my resume and suggest specific improvements to improve the ATS score.",
    });
  }

  const summary = resumeJson.basics?.summary;

  if (!summary || summary.trim().length < 60) {
    suggestions.push({
      label: "Write a professional summary",
      prompt:
        "Write a compelling professional summary for my resume based on my experience.",
    });
  }

  const workItems = Array.isArray(resumeJson.work) ? resumeJson.work : [];
  const experienceItems = Array.isArray(resumeJson.experience)
    ? resumeJson.experience
    : [];

  const allExperienceItems = [...workItems, ...experienceItems];

  const needsMetrics = allExperienceItems.some((item) => {
    const highlights = Array.isArray(item.highlights) ? item.highlights : [];
    const bullets = "bullets" in item && Array.isArray(item.bullets) ? item.bullets : [];

    const lines = [...highlights, ...bullets];

    return lines.some((line) => {
      if (typeof line !== "string") return false;

      return line.trim().length < 80 || !/\d/.test(line);
    });
  });

  if (needsMetrics) {
    suggestions.push({
      label: "Add measurable impact to bullet points",
      prompt:
        "Improve my work experience bullet points by adding specific metrics and impact.",
    });
  }

  suggestions.push({
    label: "Rewrite resume for [target role]",
    prompt: "Rewrite key sections of my resume to target a [role] position.",
  });

  const merged = [...suggestions];

  for (const fallback of fallbackSuggestions) {
    if (merged.length >= 4) break;

    const alreadyExists = merged.some((item) => item.label === fallback.label);

    if (!alreadyExists) {
      merged.push(fallback);
    }
  }

  return merged.slice(0, 4);
}

export function AISuggestionsCard({
  userId,
  onSuggestionClick,
}: AISuggestionsCardProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(fallbackSuggestions);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchResume() {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("resumes")
        .select("id, ats_score, resume_json")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Failed to fetch AI suggestions resume:", error.message);
        setHasResume(false);
        setSuggestions(fallbackSuggestions);
        setLoading(false);
        return;
      }

      const resume = (data as ResumeRow | null) ?? null;

      setHasResume(Boolean(resume));
      setSuggestions(deriveSuggestions(resume));
      setLoading(false);
    }

    fetchResume();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const displaySuggestions = useMemo(() => {
    return isMobile ? suggestions.slice(0, 3) : suggestions.slice(0, 4);
  }, [isMobile, suggestions]);

  if (loading) {
    return <AISuggestionsSkeleton isMobile={isMobile} />;
  }

  return (
    <section
      className="relative w-full min-w-0 max-md:p-[14px]"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[14px] flex items-center gap-[8px]">
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: "#8d6bff",
            flexShrink: 0,
          }}
        />

        <span
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#454647",
            textTransform: "uppercase",
          }}
        >
          AI SUGGESTIONS
        </span>

        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "10px",
            color: "#454647",
            whiteSpace: "nowrap",
          }}
        >
          1 credit/action
        </span>
      </div>

      <div
        className="relative flex flex-col gap-[4px]"
        style={{
          opacity: hasResume ? 1 : 0.3,
          pointerEvents: hasResume ? "auto" : "none",
        }}
      >
        {displaySuggestions.map((suggestion, index) => {
          const isHovered = hoveredRow === index;

          return (
            <button
              key={`${suggestion.label}-${index}`}
              type="button"
              onClick={() => onSuggestionClick(suggestion.prompt)}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
              className="group flex w-full min-w-0 items-center gap-[10px] text-left"
              style={{
                height: "40px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "none",
                background: isHovered ? "rgba(141,107,255,0.08)" : "transparent",
                cursor: "pointer",
                transition: "background 160ms ease, color 160ms ease",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  lineHeight: 1,
                  color: "#8d6bff",
                  flexShrink: 0,
                }}
              >
                ◆
              </span>

              <span
                className="min-w-0 flex-1 truncate"
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  color: isHovered ? "#f3f3f3" : "#9c9c9d",
                  transition: "color 160ms ease",
                }}
              >
                {suggestion.label}
              </span>

              <ArrowRight
                size={12}
                style={{
                  color: "#8d6bff",
                  marginLeft: "auto",
                  opacity: isMobile || isHovered ? 1 : 0,
                  transition: "opacity 160ms ease",
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </div>

      {!hasResume && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 flex items-center justify-center px-5 text-center"
          style={{
            top: "58px",
            bottom: "52px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#454647",
              lineHeight: 1.5,
            }}
          >
            Parse a resume to get personalized suggestions
          </span>
        </div>
      )}

      <div
        className="mt-[12px] pt-[12px]"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <button
          type="button"
          onClick={() => onSuggestionClick("")}
          className="group inline-flex items-center gap-[4px]"
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            fontSize: "13px",
            color: "#6a6b6c",
            transition: "color 160ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = "#8d6bff";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = "#6a6b6c";
          }}
        >
          <span>Ask AI anything</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </section>
  );
}

function AISuggestionsSkeleton({ isMobile }: { isMobile: boolean }) {
  const rowCount = isMobile ? 3 : 4;

  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[14px] flex items-center gap-[8px]">
        <SkeletonBlock width="8px" height="8px" radius="999px" />
        <SkeletonBlock width="104px" height="10px" />
        <div style={{ marginLeft: "auto" }}>
          <SkeletonBlock width="74px" height="10px" />
        </div>
      </div>

      <div className="flex flex-col gap-[4px]">
        {Array.from({ length: rowCount }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-[10px]"
            style={{
              height: "40px",
              padding: "0 10px",
            }}
          >
            <SkeletonBlock width="12px" height="12px" radius="999px" />
            <SkeletonBlock width="160px" height="12px" />
          </div>
        ))}
      </div>

      <div
        className="mt-[12px] pt-[12px]"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <SkeletonBlock width="110px" height="13px" />
      </div>
    </section>
  );
}

function SkeletonBlock({
  width,
  height,
  radius = "4px",
}: {
  width: string;
  height: string;
  radius?: string;
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#1b1c1e",
      }}
    />
  );
}

export default AISuggestionsCard;