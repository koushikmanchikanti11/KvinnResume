"use client";

import React from "react";
import type { ResumeData } from "@/lib/resume/schema";

// Field editors
import { BasicsEditor } from "./fields/basics-editor";
import { SummaryEditor } from "./fields/summary-editor";
import { ExperienceEditor } from "./fields/experience-editor";
import { EducationEditor } from "./fields/education-editor";
import { SkillsEditor } from "./fields/skills-editor";
import { ProjectsEditor } from "./fields/projects-editor";
import { CertificationsEditor } from "./fields/certifications-editor";
import { AchievementsEditor } from "./fields/achievements-editor";
import { SocialsEditor } from "./fields/socials-editor";
import { CustomSectionEditor } from "./fields/custom-section-editor";

/**
 * FormPanel — Center panel that routes to the correct field editor.
 */

interface FormPanelProps {
  resumeJson: ResumeData;
  activeSection: string;
  onChange: (updatedJson: ResumeData) => void;
  onAIRequest: (feature: string, context: unknown) => void;
}

export function FormPanel({
  resumeJson,
  activeSection,
  onChange,
  onAIRequest,
}: FormPanelProps) {
  // Generic handler for section updates
  const handleSectionChange = <K extends keyof ResumeData>(
    sectionKey: K,
    updatedSectionData: ResumeData[K]
  ) => {
    onChange({
      ...resumeJson,
      [sectionKey]: updatedSectionData,
    });
  };

  const renderActiveEditor = () => {
    switch (activeSection) {
      case "basics":
        return (
          <BasicsEditor
            data={resumeJson.basics}
            onChange={(d) => handleSectionChange("basics", d)}
          />
        );
      case "summary":
        return (
          <SummaryEditor
            data={resumeJson.summary}
            onChange={(d) => handleSectionChange("summary", d)}
            onAIRequest={onAIRequest}
          />
        );
      case "experience":
        return (
          <ExperienceEditor
            data={resumeJson.experience}
            onChange={(d) => handleSectionChange("experience", d)}
            onAIRequest={onAIRequest}
          />
        );
      case "education":
        return (
          <EducationEditor
            data={resumeJson.education}
            onChange={(d) => handleSectionChange("education", d)}
          />
        );
      case "skills":
        return (
          <SkillsEditor
            data={resumeJson.skills}
            onChange={(d) => handleSectionChange("skills", d)}
          />
        );
      case "projects":
        return (
          <ProjectsEditor
            data={resumeJson.projects}
            onChange={(d) => handleSectionChange("projects", d)}
          />
        );
      case "certifications":
        return (
          <CertificationsEditor
            data={resumeJson.certifications}
            onChange={(d) => handleSectionChange("certifications", d)}
          />
        );
      case "achievements":
        return (
          <AchievementsEditor
            data={resumeJson.achievements}
            onChange={(d) => handleSectionChange("achievements", d)}
          />
        );
      case "socialLinks":
        return (
          <SocialsEditor
            data={resumeJson.socialLinks}
            onChange={(d) => handleSectionChange("socialLinks", d)}
          />
        );
      case "customSections":
        return (
          <CustomSectionEditor
            data={resumeJson.customSections}
            onChange={(d) => handleSectionChange("customSections", d)}
          />
        );
      default:
        return (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-lg"
            style={{ border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <span style={{ color: "#454647", fontSize: 13 }}>
              Select a section to edit
            </span>
          </div>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-3xl mx-auto">
      {renderActiveEditor()}
    </div>
  );
}
