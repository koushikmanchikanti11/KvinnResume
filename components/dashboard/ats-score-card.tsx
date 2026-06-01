"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  CheckCircle2,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface ATSScoreCardProps {
  userId: string;
  onImprove?: () => void;
}

type ChecklistStatus = "pass" | "fail" | "unknown";

interface ChecklistItem {
  label: string;
  status: ChecklistStatus;
}

interface ResumeJson {
  basics?: Record<string, unknown> | null;
  skills?: unknown[] | Record<string, unknown> | null;
  work?: ExperienceItem[] | null;
  experience?: ExperienceItem[] | null;
  education?: unknown[] | null;
}

interface ExperienceItem {
  highlights?: unknown[] | null;
  bullets?: unknown[] | null;
  summary?: string | null;
  description?: string | null;
}

interface ResumeRow {
  id: string;
  ats_score: number | null;
  resume_json: ResumeJson | null;
}

interface ResumeVersionRow {
  resume_json?: ResumeJson | null;
  ats_score?: number | null;
}

const actionVerbs = [
  "achieved",
  "built",
  "created",
  "developed",
  "designed",
  "implemented",
  "improved",
  "increased",
  "reduced",
  "launched",
  "led",
  "managed",
  "optimized",
  "delivered",
  "automated",
  "integrated",
  "engineered",
  "collaborated",
  "enhanced",
  "resolved",
];

function getScoreColor(score: number | null) {
  if (score === null) return "#454647";
  if (score >= 80) return "#00ac5c";
  if (score >= 60) return "#e7c59a";
  return "#ff6363";
}

function getSkillsCount(skills: ResumeJson["skills"]) {
  if (!skills) return 0;

  if (Array.isArray(skills)) return skills.length;

  if (typeof skills === "object") {
    return Object.values(skills).flat().length;
  }

  return 0;
}

function getExperienceItems(resumeJson: ResumeJson | null) {
  if (!resumeJson) return [];

  const work = Array.isArray(resumeJson.work) ? resumeJson.work : [];
  const experience = Array.isArray(resumeJson.experience)
    ? resumeJson.experience
    : [];

  return [...work, ...experience];
}

function getExperienceLines(resumeJson: ResumeJson | null) {
  const items = getExperienceItems(resumeJson);
  const lines: string[] = [];

  for (const item of items) {
    const highlights = Array.isArray(item.highlights) ? item.highlights : [];
    const bullets = Array.isArray(item.bullets) ? item.bullets : [];

    for (const line of [...highlights, ...bullets]) {
      if (typeof line === "string" && line.trim()) {
        lines.push(line.trim());
      }
    }

    if (typeof item.summary === "string" && item.summary.trim()) {
      lines.push(item.summary.trim());
    }

    if (typeof item.description === "string" && item.description.trim()) {
      lines.push(item.description.trim());
    }
  }

  return lines;
}

function startsWithActionVerb(line: string) {
  const firstWord = line
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[^a-zA-Z]/g, "")
    .toLowerCase();

  if (!firstWord) return false;

  return actionVerbs.includes(firstWord);
}

function buildChecklist(resumeJson: ResumeJson | null): ChecklistItem[] {
  if (!resumeJson) {
    return [
      { label: "Keywords present", status: "unknown" },
      { label: "Section hierarchy", status: "unknown" },
      { label: "Action verbs", status: "unknown" },
      { label: "Measurable results", status: "unknown" },
    ];
  }

  const experienceItems = getExperienceItems(resumeJson);
  const experienceLines = getExperienceLines(resumeJson);

  const hasKeywords = getSkillsCount(resumeJson.skills) > 3;

  const hasSectionHierarchy =
    Boolean(resumeJson.basics) &&
    experienceItems.length > 0 &&
    Array.isArray(resumeJson.education) &&
    resumeJson.education.length > 0;

  const hasActionVerbs = experienceLines.some(startsWithActionVerb);
  const hasMeasurableResults = experienceLines.some((line) => /\d/.test(line));

  return [
    {
      label: "Keywords present",
      status: hasKeywords ? "pass" : "fail",
    },
    {
      label: "Section hierarchy",
      status: hasSectionHierarchy ? "pass" : "fail",
    },
    {
      label: "Action verbs",
      status: hasActionVerbs ? "pass" : "fail",
    },
    {
      label: "Measurable results",
      status: hasMeasurableResults ? "pass" : "fail",
    },
  ];
}

function estimateAtsScoreFromJson(resumeJson: ResumeJson | null) {
  const checklist = buildChecklist(resumeJson);

  if (checklist.every((item) => item.status === "unknown")) {
    return null;
  }

  const passed = checklist.filter((item) => item.status === "pass").length;

  return Math.round((passed / checklist.length) * 100);
}

function shouldShowImprove(score: number | null, checklist: ChecklistItem[]) {
  if (score !== null && score < 80) return true;

  return checklist.some((item) => item.status === "fail");
}

export function ATSScoreCard({ userId, onImprove }: ATSScoreCardProps) {
  const [resume, setResume] = useState<ResumeRow | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchATSData() {
      setLoading(true);

      const supabase = createClient();

      const { data: resumeData, error: resumeError } = await supabase
        .from("resumes")
        .select("id, ats_score, resume_json")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (resumeError) {
        console.error("Failed to fetch ATS resume:", resumeError.message);
        setResume(null);
        setPreviousScore(null);
        setLoading(false);
        return;
      }

      const activeResume = (resumeData as ResumeRow | null) ?? null;
      setResume(activeResume);

      if (!activeResume?.id) {
        setPreviousScore(null);
        setLoading(false);
        return;
      }

      const { data: prevVersion, error: prevError } = await supabase
        .from("resume_versions")
        .select("resume_json, ats_score")
        .eq("resume_id", activeResume.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (prevError) {
        setPreviousScore(null);
      } else {
        const previous = (prevVersion as ResumeVersionRow | null) ?? null;

        setPreviousScore(
          previous?.ats_score ??
            estimateAtsScoreFromJson(previous?.resume_json ?? null)
        );
      }

      setLoading(false);
    }

    fetchATSData();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const checklist = useMemo(
    () => buildChecklist(resume?.resume_json ?? null),
    [resume]
  );

  const score = resume?.ats_score ?? null;
  const scoreColor = getScoreColor(score);

  const delta =
    score !== null && previousScore !== null ? score - previousScore : null;

  const improveVisible = shouldShowImprove(score, checklist);

  if (loading) {
    return <ATSScoreSkeleton />;
  }

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
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: "#454647",
          textTransform: "uppercase",
        }}
      >
        ATS SCORE
      </div>

      <div
        className="flex items-baseline gap-[6px]"
        style={{
          marginTop: "12px",
        }}
      >
        <span
          style={{
            fontSize: "40px",
            fontWeight: 700,
            lineHeight: 0.95,
            color: scoreColor,
          }}
        >
          {score === null ? "—" : score}
        </span>

        <span
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#6a6b6c",
          }}
        >
          / 100
        </span>
      </div>

      {delta !== null && delta !== 0 && (
        <div
          className="flex items-center gap-[4px]"
          style={{
            marginTop: "6px",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "12px",
            color: delta > 0 ? "#00ac5c" : "#ff6363",
          }}
        >
          {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>
            {delta > 0 ? `+${delta}` : delta} since last edit
          </span>
        </div>
      )}

      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.05)",
          marginTop: "14px",
          marginBottom: "14px",
        }}
      />

      <div className="flex flex-col">
        {checklist.map((item, index) => (
          <ChecklistRow
            key={item.label}
            item={item}
            isLast={index === checklist.length - 1}
          />
        ))}
      </div>

      {!resume && (
        <p
          style={{
            marginTop: "14px",
            marginBottom: 0,
            fontSize: "13px",
            color: "#454647",
          }}
        >
          Parse a resume to generate your ATS score
        </p>
      )}

      {resume && improveVisible && (
        <button
          type="button"
          onClick={onImprove}
          disabled={!onImprove}
          className="inline-flex items-center gap-[6px]"
          style={{
            marginTop: "14px",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: onImprove ? "pointer" : "default",
            fontSize: "13px",
            color: "#8d6bff",
          }}
        >
          Improve with AI →
        </button>
      )}
    </section>
  );
}

function ChecklistRow({
  item,
  isLast,
}: {
  item: ChecklistItem;
  isLast: boolean;
}) {
  const isPass = item.status === "pass";
  const isUnknown = item.status === "unknown";

  return (
    <div
      className="flex items-center gap-[10px]"
      style={{
        height: "28px",
        padding: "0 2px",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {isUnknown ? (
        <Minus size={14} color="#454647" />
      ) : isPass ? (
        <CheckCircle2 size={14} color="#00ac5c" />
      ) : (
        <AlertCircle size={14} color="#e7c59a" />
      )}

      <span
        style={{
          fontSize: "13px",
          fontWeight: 400,
          color: isPass ? "#f3f3f3" : "#9c9c9d",
        }}
      >
        {item.label}
      </span>
    </div>
  );
}

function ATSScoreSkeleton() {
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
      <SkeletonBlock width="76px" height="10px" />

      <div style={{ marginTop: "12px" }}>
        <SkeletonBlock width="80px" height="48px" />
      </div>

      <div style={{ marginTop: "10px" }}>
        <SkeletonBlock width="120px" height="12px" />
      </div>

      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.05)",
          marginTop: "14px",
          marginBottom: "14px",
        }}
      />

      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center gap-[10px]"
          style={{ height: "28px" }}
        >
          <SkeletonBlock width="16px" height="16px" radius="999px" />
          <SkeletonBlock width="130px" height="12px" />
        </div>
      ))}
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

export default ATSScoreCard;