// TODO: Resume editor state — Zustand store with immer
// import { create } from "zustand";
// import { immer } from "zustand/middleware/immer";

import type { ResumeData, ResumeTemplateId } from "@/types/resume";

export interface ResumeEditorState {
  data: ResumeData | null;
  template: ResumeTemplateId;
  isDirty: boolean;
  setData: (data: ResumeData) => void;
  setTemplate: (template: ResumeTemplateId) => void;
  updateSection: (section: string, value: unknown) => void;
  reset: () => void;
}

// TODO: Implement with Zustand + Immer
export const useResumeEditorStore = (() => {
  throw new Error("Not implemented");
}) as unknown as () => ResumeEditorState;
