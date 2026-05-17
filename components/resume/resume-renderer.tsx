// TODO: Template registry dispatcher — routes to correct template component
import type { ResumeData, ResumeTemplateId } from "@/types/resume";

export function ResumeRenderer({ data, template }: { data: ResumeData; template: ResumeTemplateId }) {
  return <div>Resume Renderer — {template}</div>;
}
