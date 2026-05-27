import { z } from "zod";

export const resumeDataSchema = z.object({
  basics: z.object({
    name: z.string(),
    title: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    summary: z.string().optional(),
    links: z.object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      leetcode: z.string().optional(),
      portfolio: z.string().optional(),
      website: z.string().optional(),
    }).optional(),
  }),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    bullets: z.array(z.string()).default([]),
  })).default([]),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string().optional(),
    field: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    score: z.string().optional(),
  })).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    technologies: z.array(z.string()).default([]),
    links: z.array(z.string()).default([]),
    bullets: z.array(z.string()).default([]),
  })).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    date: z.string().optional(),
  })).default([]),
});

export function validateAIOutput(data: unknown) {
  return resumeDataSchema.safeParse(data);
}
