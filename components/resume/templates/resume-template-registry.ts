// TODO: Template registry — maps template IDs to components and metadata
import type { ResumeTemplateId } from "@/types/resume";

export interface TemplateMetadata {
  id: ResumeTemplateId;
  name: string;
  description: string;
  thumbnail: string;
  premium: boolean;
}

export const templateRegistry: TemplateMetadata[] = [
  { id: "pixel", name: "Pixel", description: "Retro developer template", thumbnail: "/images/templates/pixel.png", premium: false },
  { id: "modern", name: "Modern", description: "Clean ATS-friendly template", thumbnail: "/images/templates/modern.png", premium: false },
  { id: "premium", name: "Premium", description: "Executive style template", thumbnail: "/images/templates/premium.png", premium: true },
  { id: "casual", name: "Casual", description: "Creative student template", thumbnail: "/images/templates/casual.png", premium: false },
];
