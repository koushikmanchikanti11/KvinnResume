/**
 * KvinnResume — Canonical Resume Schema
 *
 * Single source of truth for the editor ResumeData shape.
 * All field editors, the store, and the PATCH route validate against this.
 *
 * DO NOT import parser/AI/Groq/Bedrock logic here.
 */

import { z } from "zod";

// ── Default section order ────────────────────────────────────

export const DEFAULT_SECTION_ORDER = [
  "basics",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "socialLinks",
  "customSections",
] as const;

// ── Zod Schemas ──────────────────────────────────────────────

const basicsSchema = z.object({
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  portfolio: z.string().default(""),
  headline: z.string().default(""),
});

const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().default(""),
  position: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  description: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  gpa: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

const skillItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  category: z.string().default(""),
  level: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .nullable()
    .default(null),
});

const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  description: z.string().default(""),
  url: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
});

const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
});

const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  description: z.string().default(""),
  date: z.string().default(""),
});

const socialLinkItemSchema = z.object({
  id: z.string(),
  platform: z.string().default(""),
  url: z.string().default(""),
  username: z.string().default(""),
});

const customSectionItemSchema = z.object({
  id: z.string(),
  content: z.string().default(""),
});

const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  items: z.array(customSectionItemSchema).default([]),
});

export const resumeDataSchema = z.object({
  basics: basicsSchema.default({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    portfolio: "",
    headline: "",
  }),
  summary: z.string().default(""),
  experience: z.array(experienceItemSchema).default([]),
  education: z.array(educationItemSchema).default([]),
  skills: z.array(skillItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  certifications: z.array(certificationItemSchema).default([]),
  achievements: z.array(achievementItemSchema).default([]),
  socialLinks: z.array(socialLinkItemSchema).default([]),
  customSections: z.array(customSectionSchema).default([]),
  sectionOrder: z
    .array(z.string())
    .default([...DEFAULT_SECTION_ORDER]),
});

// ── TypeScript Type ──────────────────────────────────────────

export type ResumeData = z.infer<typeof resumeDataSchema>;

export type ResumeBasics = ResumeData["basics"];
export type ResumeExperienceItem = ResumeData["experience"][number];
export type ResumeEducationItem = ResumeData["education"][number];
export type ResumeSkillItem = ResumeData["skills"][number];
export type ResumeProjectItem = ResumeData["projects"][number];
export type ResumeCertificationItem = ResumeData["certifications"][number];
export type ResumeAchievementItem = ResumeData["achievements"][number];
export type ResumeSocialLinkItem = ResumeData["socialLinks"][number];
export type ResumeCustomSection = ResumeData["customSections"][number];
export type ResumeCustomSectionItem = ResumeCustomSection["items"][number];

// ── Helpers ──────────────────────────────────────────────────

/** Returns a fully scaffolded empty resume with all sections initialized. */
export function createEmptyResumeData(): ResumeData {
  return {
    basics: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      portfolio: "",
      headline: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    socialLinks: [],
    customSections: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

/**
 * Coerces unknown input (e.g. from Supabase JSONB) to a valid ResumeData.
 * - Fills missing fields with defaults.
 * - Generates UUIDs for array items missing `id`.
 * - Strips extra keys not in the schema.
 */
export function normalizeResumeData(raw: unknown): ResumeData {
  if (!raw || typeof raw !== "object") {
    return createEmptyResumeData();
  }

  const input = raw as Record<string, unknown>;

  // Ensure every array item has an id before parsing
  const arraySections = [
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "achievements",
    "socialLinks",
  ] as const;

  for (const key of arraySections) {
    if (Array.isArray(input[key])) {
      input[key] = (input[key] as Record<string, unknown>[]).map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
      }));
    }
  }

  // customSections needs nested items to also have ids
  if (Array.isArray(input.customSections)) {
    input.customSections = (
      input.customSections as Record<string, unknown>[]
    ).map((section) => ({
      ...section,
      id: (section as Record<string, unknown>).id || crypto.randomUUID(),
      items: Array.isArray((section as Record<string, unknown>).items)
        ? (
            (section as Record<string, unknown>).items as Record<
              string,
              unknown
            >[]
          ).map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          }))
        : [],
    }));
  }

  const result = resumeDataSchema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  // If parsing fails, try to salvage what we can by using defaults
  // for missing/invalid fields
  console.warn(
    "[normalizeResumeData] Validation issues, using defaults for invalid fields:",
    result.error.flatten().fieldErrors
  );

  return resumeDataSchema.parse({
    ...createEmptyResumeData(),
    ...input,
  });
}

// ── Section Labels ───────────────────────────────────────────

export const SECTION_LABELS: Record<string, string> = {
  basics: "Contact Info",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
  socialLinks: "Social Links",
  customSections: "Custom Sections",
};

export const SECTION_ICONS: Record<string, string> = {
  basics: "👤",
  summary: "📝",
  experience: "💼",
  education: "🎓",
  skills: "⚡",
  projects: "🔧",
  certifications: "📜",
  achievements: "🏆",
  socialLinks: "🔗",
  customSections: "📋",
};
