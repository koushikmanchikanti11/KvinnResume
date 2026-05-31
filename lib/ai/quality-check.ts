import type { ValidatedResumeData } from "./schema-validator";

export type ResumeQualityResult = {
  score: number;
  grade: "excellent" | "good" | "average" | "poor";
  issues: string[];
  strengths: string[];
};

export function calculateResumeQualityScore(
  resume: ValidatedResumeData
): number {
  return calculateResumeQuality(resume).score;
}

export function calculateResumeQuality(
  resume: ValidatedResumeData
): ResumeQualityResult {
  let score = 0;
  const issues: string[] = [];
  const strengths: string[] = [];

  if (resume.basics.fullName?.trim()) score += 8;
  else issues.push("Missing full name");

  if (resume.basics.email?.trim()) score += 8;
  else issues.push("Missing email");

  if (resume.basics.phone?.trim()) score += 5;
  else issues.push("Missing phone number");

  if (
    resume.basics.linkedin?.trim() ||
    resume.basics.github?.trim() ||
    resume.basics.portfolio?.trim() ||
    resume.basics.website?.trim() ||
    resume.socialLinks.length > 0
  ) {
    score += 7;
    strengths.push("Has professional links");
  } else {
    issues.push("Missing professional links");
  }

  const summaryLength = resume.summary?.trim().length ?? 0;

  if (summaryLength >= 60) score += 10;
  else if (summaryLength >= 30) score += 6;
  else issues.push("Summary is missing or too short");

  if (resume.experience.length > 0) score += 15;
  else issues.push("Missing experience section");

  const experienceBullets = resume.experience.reduce(
    (total, exp) => total + (exp.highlights?.filter(Boolean).length ?? 0),
    0
  );

  if (experienceBullets >= 6) score += 10;
  else if (experienceBullets >= 3) score += 5;
  else issues.push("Experience needs stronger bullet points");

  if (resume.education.length > 0) score += 10;
  else issues.push("Missing education section");

  const uniqueSkills = new Set(
    resume.skills
      .map((skill) => skill.name?.trim().toLowerCase())
      .filter(Boolean)
  );

  if (uniqueSkills.size >= 8) score += 15;
  else if (uniqueSkills.size >= 5) score += 10;
  else if (uniqueSkills.size >= 3) score += 6;
  else issues.push("Skills section is weak or missing");

  if (resume.projects.length > 0) score += 10;
  else issues.push("Missing projects section");

  if (resume.certifications.length > 0 || resume.achievements.length > 0) {
    score += 5;
    strengths.push("Has certifications or achievements");
  }

  const allBullets = [
    ...resume.experience.flatMap((exp) => exp.highlights ?? []),
    ...resume.projects.flatMap((project) => project.highlights ?? []),
  ];

  const actionVerbRegex =
    /\b(built|developed|created|designed|implemented|improved|optimized|managed|led|launched|automated|integrated|increased|reduced|delivered|deployed|engineered|collaborated|analyzed)\b/i;

  const measurableRegex =
    /\b(\d+%|\d+\+|\d+x|\d+ users|\d+ projects|\d+ APIs|\d+ clients|\d+ months|\d+ years)\b/i;

  const actionBulletCount = allBullets.filter((bullet) =>
    actionVerbRegex.test(bullet)
  ).length;

  const measurableBulletCount = allBullets.filter((bullet) =>
    measurableRegex.test(bullet)
  ).length;

  if (actionBulletCount >= 4) score += 7;
  else if (actionBulletCount >= 2) score += 4;
  else issues.push("Bullet points need stronger action verbs");

  if (measurableBulletCount >= 2) score += 5;
  else issues.push("Add measurable achievements where possible");

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    grade: getGrade(finalScore),
    issues,
    strengths,
  };
}

function getGrade(score: number): ResumeQualityResult["grade"] {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "average";
  return "poor";
}