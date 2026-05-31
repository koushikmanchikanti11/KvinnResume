// lib/ai/schema-validator.ts
// Validates and repairs AI-generated Resume JSON.
// Rule: never save invalid parsed_json.

import { z } from "zod";
import { repairResumeJSONWithGroq } from "./groq";

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

const StringArraySchema = z.array(z.string()).default([]);

const NullableLevelSchema = z
  .enum(["beginner", "intermediate", "advanced", "expert"])
  .nullable()
  .optional()
  .default(null);

// -----------------------------------------------------
// Resume Schema
// -----------------------------------------------------

const ResumeBasicsSchema = z.object({
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

const ResumeExperienceSchema = z.object({
  id: z.string().default(""),
  company: z.string().default(""),
  position: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  description: z.string().default(""),
  highlights: StringArraySchema,
});

const ResumeEducationSchema = z.object({
  id: z.string().default(""),
  institution: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  gpa: z.string().default(""),
  highlights: StringArraySchema,
});

const ResumeSkillSchema = z.object({
  id: z.string().default(""),
  name: z.string().default(""),
  category: z.string().default(""),
  level: NullableLevelSchema,
});

const ResumeProjectSchema = z.object({
  id: z.string().default(""),
  name: z.string().default(""),
  description: z.string().default(""),
  url: z.string().default(""),
  technologies: StringArraySchema,
  highlights: StringArraySchema,
  startDate: z.string().default(""),
  endDate: z.string().default(""),
});

const ResumeCertificationSchema = z.object({
  id: z.string().default(""),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
});

const ResumeAchievementSchema = z.object({
  id: z.string().default(""),
  title: z.string().default(""),
  description: z.string().default(""),
  date: z.string().default(""),
});

const ResumeSocialLinkSchema = z.object({
  id: z.string().default(""),
  platform: z.string().default(""),
  url: z.string().default(""),
  username: z.string().default(""),
});

const ResumeCustomSectionItemSchema = z.object({
  id: z.string().default(""),
  content: z.string().default(""),
});

const ResumeCustomSectionSchema = z.object({
  id: z.string().default(""),
  title: z.string().default(""),
  items: z.array(ResumeCustomSectionItemSchema).default([]),
});

export const ResumeDataSchema = z.object({
  basics: ResumeBasicsSchema.default({}),
  summary: z.string().default(""),

  experience: z.array(ResumeExperienceSchema).default([]),
  education: z.array(ResumeEducationSchema).default([]),
  skills: z.array(ResumeSkillSchema).default([]),
  projects: z.array(ResumeProjectSchema).default([]),
  certifications: z.array(ResumeCertificationSchema).default([]),
  achievements: z.array(ResumeAchievementSchema).default([]),
  socialLinks: z.array(ResumeSocialLinkSchema).default([]),
  customSections: z.array(ResumeCustomSectionSchema).default([]),

  sectionOrder: z.array(z.string()).default([
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
  ]),
});

export type ValidatedResumeData = z.infer<typeof ResumeDataSchema>;

// -----------------------------------------------------
// Validation Result Types
// -----------------------------------------------------

export type ValidationResult =
  | {
      success: true;
      data: ValidatedResumeData;
    }
  | {
      success: false;
      error: string;
      issues?: z.ZodIssue[];
    };

// -----------------------------------------------------
// Public Validation Functions
// -----------------------------------------------------

export function validateResumeJson(input: unknown): ValidationResult {
  const normalized = normalizeAIOutput(input);
  const result = ResumeDataSchema.safeParse(normalized);

  if (result.success) {
    return {
      success: true,
      data: addMissingIds(result.data),
    };
  }

  return {
    success: false,
    error: `Resume JSON validation failed: ${result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")}`,
    issues: result.error.issues,
  };
}

export function safeParseResumeJson(jsonString: string): ValidationResult {
  if (!jsonString || typeof jsonString !== "string") {
    return {
      success: false,
      error: "AI output is empty or not a string.",
    };
  }

  if (/<html|<body|<div|<span|<!doctype/i.test(jsonString)) {
    return {
      success: false,
      error: "AI output contains HTML, which is not allowed.",
    };
  }

  const cleaned = stripMarkdownCodeFence(jsonString);

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      success: false,
      error: "AI output is not valid JSON.",
    };
  }

  return validateResumeJson(parsed);
}

export async function repairResumeJsonIfNeeded(
  rawOutput: string,
  rawMarkdown: string
): Promise<ValidationResult> {
  console.warn("[schema-validator] Attempting repair of invalid resume JSON...");

  try {
    const repairedOutput = await repairResumeJSONWithGroq(
      rawMarkdown,
      rawOutput
    );

    const repairedResult = safeParseResumeJson(repairedOutput);

    if (repairedResult.success) {
      console.log("[schema-validator] Repair succeeded.");
      return repairedResult;
    }

    console.error(
      "[schema-validator] Repair produced invalid JSON:",
      repairedResult.error
    );

    return {
      success: false,
      error: "AI structuring failed after validation repair.",
    };
  } catch (error) {
    console.error(
      "[schema-validator] Repair attempt failed:",
      error instanceof Error ? error.message : error
    );

    return {
      success: false,
      error: "AI structuring failed after validation repair.",
    };
  }
}

// Backward-compatible alias for resume-ai.ts
export function validateAIOutput(input: unknown): ValidationResult {
  return validateResumeJson(input);
}

// -----------------------------------------------------
// Internal Normalization
// -----------------------------------------------------

function stripMarkdownCodeFence(value: string): string {
  let cleaned = value.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

function normalizeAIOutput(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;

  const obj = input as Record<string, any>;
  const normalized: Record<string, any> = { ...obj };

  // Some models return { resume: {...} } or { data: {...} }
  if (normalized.resume && typeof normalized.resume === "object") {
    return normalizeAIOutput(normalized.resume);
  }

  if (normalized.data && typeof normalized.data === "object") {
    return normalizeAIOutput(normalized.data);
  }

  // Ensure basics exists
  if (!normalized.basics || typeof normalized.basics !== "object") {
    normalized.basics = {};
  }

  const basics = normalized.basics as Record<string, any>;

  if (!basics.fullName && basics.name) basics.fullName = basics.name;
  if (!basics.headline && basics.title) basics.headline = basics.title;
  if (!basics.email && normalized.email) basics.email = normalized.email;
  if (!basics.phone && normalized.phone) basics.phone = normalized.phone;
  if (!basics.location && normalized.location) basics.location = normalized.location;

  if (basics.links && typeof basics.links === "object") {
    const links = basics.links as Record<string, any>;
    if (!basics.github && links.github) basics.github = links.github;
    if (!basics.linkedin && links.linkedin) basics.linkedin = links.linkedin;
    if (!basics.portfolio && links.portfolio) basics.portfolio = links.portfolio;
    if (!basics.website && links.website) basics.website = links.website;
  }

  normalized.basics = basics;

  normalized.summary =
    typeof normalized.summary === "string" ? normalized.summary : "";

  normalized.experience = normalizeExperience(normalized.experience);
  normalized.education = normalizeEducation(normalized.education);
  normalized.skills = normalizeSkills(normalized.skills);
  normalized.projects = normalizeProjects(normalized.projects);
  normalized.certifications = normalizeCertifications(normalized.certifications);
  normalized.achievements = normalizeAchievements(normalized.achievements);
  normalized.socialLinks = normalizeSocialLinks(normalized.socialLinks, basics);
  normalized.customSections = normalizeCustomSections(normalized.customSections);

  if (!Array.isArray(normalized.sectionOrder)) {
    normalized.sectionOrder = [
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
    ];
  }

  return normalized;
}

function normalizeExperience(input: unknown): unknown[] {
  if (!Array.isArray(input)) return [];

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      return {
        id: `exp-${index + 1}`,
        company: "",
        position: "",
        highlights: [],
      };
    }

    const exp = { ...(item as Record<string, any>) };

    if (!exp.id) exp.id = `exp-${index + 1}`;
    if (!exp.position && exp.role) exp.position = exp.role;
    if (!exp.position && exp.title) exp.position = exp.title;
    if (!exp.company && exp.organization) exp.company = exp.organization;
    if (!exp.highlights && exp.bullets) exp.highlights = exp.bullets;
    if (!Array.isArray(exp.highlights)) exp.highlights = [];

    return exp;
  });
}

function normalizeEducation(input: unknown): unknown[] {
  if (!Array.isArray(input)) return [];

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      return {
        id: `edu-${index + 1}`,
        institution: "",
        degree: "",
      };
    }

    const edu = { ...(item as Record<string, any>) };

    if (!edu.id) edu.id = `edu-${index + 1}`;
    if (!edu.institution && edu.school) edu.institution = edu.school;
    if (!edu.institution && edu.college) edu.institution = edu.college;
    if (!edu.degree && edu.course) edu.degree = edu.course;
    if (!edu.gpa && edu.score) edu.gpa = edu.score;
    if (!Array.isArray(edu.highlights)) edu.highlights = [];

    return edu;
  });
}

function normalizeSkills(input: unknown): unknown[] {
  if (!Array.isArray(input)) return [];

  return input.map((skill, index) => {
    if (typeof skill === "string") {
      return {
        id: `skill-${index + 1}`,
        name: skill,
        category: "",
        level: null,
      };
    }

    if (skill && typeof skill === "object") {
      const s = { ...(skill as Record<string, any>) };
      if (!s.id) s.id = `skill-${index + 1}`;
      if (!s.name && s.skill) s.name = s.skill;
      if (!s.name) s.name = "";
      return s;
    }

    return {
      id: `skill-${index + 1}`,
      name: "",
      category: "",
      level: null,
    };
  });
}

function normalizeProjects(input: unknown): unknown[] {
  if (!Array.isArray(input)) return [];

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      return {
        id: `proj-${index + 1}`,
        name: "",
        highlights: [],
        technologies: [],
      };
    }

    const project = { ...(item as Record<string, any>) };

    if (!project.id) project.id = `proj-${index + 1}`;
    if (!project.name && project.title) project.name = project.title;
    if (!project.highlights && project.bullets) project.highlights = project.bullets;
    if (!Array.isArray(project.highlights)) project.highlights = [];
    if (!Array.isArray(project.technologies)) project.technologies = [];

    if (
      !project.url &&
      Array.isArray(project.links) &&
      project.links.length > 0
    ) {
      project.url = project.links[0];
    }

    return project;
  });
}

function normalizeCertifications(input: unknown): unknown[] {
  if (!Array.isArray(input)) return [];

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      return {
        id: `cert-${index + 1}`,
        name: "",
      };
    }

    const cert = { ...(item as Record<string, any>) };

    if (!cert.id) cert.id = `cert-${index + 1}`;
    if (!cert.name && cert.title) cert.name = cert.title;

    return cert;
  });
}

function normalizeAchievements(input: unknown): unknown[] {
  if (!Array.isArray(input)) return [];

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      return {
        id: `ach-${index + 1}`,
        title: "",
      };
    }

    const achievement = { ...(item as Record<string, any>) };

    if (!achievement.id) achievement.id = `ach-${index + 1}`;
    if (!achievement.title && achievement.name) achievement.title = achievement.name;

    return achievement;
  });
}

function normalizeSocialLinks(
  input: unknown,
  basics: Record<string, any>
): unknown[] {
  const links: Record<string, string> = {};

  if (basics.linkedin) links.linkedin = basics.linkedin;
  if (basics.github) links.github = basics.github;
  if (basics.portfolio) links.portfolio = basics.portfolio;
  if (basics.website) links.website = basics.website;

  const fromBasics = Object.entries(links).map(([platform, url], index) => ({
    id: `social-basic-${index + 1}`,
    platform,
    url,
    username: "",
  }));

  if (!Array.isArray(input)) return fromBasics;

  const fromInput = input.map((item, index) => {
    if (!item || typeof item !== "object") {
      return {
        id: `social-${index + 1}`,
        platform: "",
        url: "",
        username: "",
      };
    }

    const link = { ...(item as Record<string, any>) };

    if (!link.id) link.id = `social-${index + 1}`;
    if (!link.url && link.href) link.url = link.href;
    if (!link.platform && link.name) link.platform = link.name;

    return link;
  });

  return [...fromBasics, ...fromInput];
}

function normalizeCustomSections(input: unknown): unknown[] {
  if (!Array.isArray(input)) return [];

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      return {
        id: `custom-${index + 1}`,
        title: "",
        items: [],
      };
    }

    const section = { ...(item as Record<string, any>) };

    if (!section.id) section.id = `custom-${index + 1}`;
    if (!section.title && section.name) section.title = section.name;

    if (!Array.isArray(section.items)) {
      section.items = [];
    }

    section.items = section.items.map((sectionItem: any, itemIndex: number) => {
      if (typeof sectionItem === "string") {
        return {
          id: `custom-${index + 1}-item-${itemIndex + 1}`,
          content: sectionItem,
        };
      }

      if (sectionItem && typeof sectionItem === "object") {
        return {
          id:
            sectionItem.id ||
            `custom-${index + 1}-item-${itemIndex + 1}`,
          content: sectionItem.content || sectionItem.text || "",
        };
      }

      return {
        id: `custom-${index + 1}-item-${itemIndex + 1}`,
        content: "",
      };
    });

    return section;
  });
}

// -----------------------------------------------------
// Final ID Safety
// -----------------------------------------------------

function addMissingIds(data: ValidatedResumeData): ValidatedResumeData {
  return {
    ...data,
    experience: data.experience.map((item, index) => ({
      ...item,
      id: item.id || `exp-${index + 1}`,
    })),
    education: data.education.map((item, index) => ({
      ...item,
      id: item.id || `edu-${index + 1}`,
    })),
    skills: data.skills.map((item, index) => ({
      ...item,
      id: item.id || `skill-${index + 1}`,
    })),
    projects: data.projects.map((item, index) => ({
      ...item,
      id: item.id || `proj-${index + 1}`,
    })),
    certifications: data.certifications.map((item, index) => ({
      ...item,
      id: item.id || `cert-${index + 1}`,
    })),
    achievements: data.achievements.map((item, index) => ({
      ...item,
      id: item.id || `ach-${index + 1}`,
    })),
    socialLinks: data.socialLinks.map((item, index) => ({
      ...item,
      id: item.id || `social-${index + 1}`,
    })),
    customSections: data.customSections.map((section, index) => ({
      ...section,
      id: section.id || `custom-${index + 1}`,
      items: section.items.map((item, itemIndex) => ({
        ...item,
        id: item.id || `custom-${index + 1}-item-${itemIndex + 1}`,
      })),
    })),
  };
}