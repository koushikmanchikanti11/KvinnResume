// Resume data types — mirrors docs/resume schema.json

export type ResumeTemplateId = "pixel" | "modern" | "premium" | "casual";

export interface ResumeBasics {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  headline?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  highlights: string[];
}

export interface ResumeSkill {
  id: string;
  name: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface ResumeProject {
  id: string;
  name: string;
  description?: string;
  url?: string;
  technologies: string[];
  highlights: string[];
  startDate?: string;
  endDate?: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface ResumeAchievement {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

export interface ResumeSocialLink {
  id: string;
  platform: string;
  url: string;
  username?: string;
}

export interface ResumeCustomSection {
  id: string;
  title: string;
  items: { id: string; content: string }[];
}

export interface ResumeData {
  id?: string;
  basics: ResumeBasics;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  achievements: ResumeAchievement[];
  socialLinks: ResumeSocialLink[];
  customSections: ResumeCustomSection[];
  sectionOrder: string[];
}
