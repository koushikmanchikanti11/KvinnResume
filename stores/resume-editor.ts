/**
 * KvinnResume — Resume Editor Store
 *
 * Zustand + Immer state management for the resume editor.
 * This store is the single source of editor truth.
 *
 * Rules:
 * - Every content mutation sets isDirty = true.
 * - Store NEVER calls fetch() or Supabase directly.
 * - Store only manages state — save logic lives in the editor page.
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ResumeData } from "@/lib/resume/schema";

// ── State Shape ──────────────────────────────────────────────

export interface ResumeEditorState {
  // Data
  resumeId: string | null;
  title: string;
  data: ResumeData | null;
  templateId: string;
  activeSection: string;
  sectionOrder: string[];

  // Save tracking
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;

  // Publish state (client-side mirror of DB)
  isPublished: boolean;
  publicSlug: string | null;

  // Actions
  setResume: (
    resumeId: string,
    title: string,
    data: ResumeData,
    templateId: string,
    isPublished?: boolean,
    publicSlug?: string | null
  ) => void;
  setData: (data: ResumeData) => void;
  setTemplate: (templateId: string) => void;
  setActiveSection: (section: string) => void;
  updateSection: <K extends keyof ResumeData>(
    sectionKey: K,
    value: ResumeData[K]
  ) => void;
  addItem: (sectionKey: string, item: Record<string, unknown>) => void;
  removeItem: (sectionKey: string, itemId: string) => void;
  reorderItems: (
    sectionKey: string,
    activeId: string,
    overId: string
  ) => void;
  reorderSections: (nextOrder: string[]) => void;
  markSaving: () => void;
  markSaved: () => void;
  markSaveFailed: (message: string) => void;
  setPublished: (isPublished: boolean, slug: string | null) => void;
  reset: () => void;
}

// ── Initial State ────────────────────────────────────────────

const initialState = {
  resumeId: null as string | null,
  title: "",
  data: null as ResumeData | null,
  templateId: "pixel",
  activeSection: "basics",
  sectionOrder: [
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
  ],
  isDirty: false,
  isSaving: false,
  saveError: null as string | null,
  lastSavedAt: null as string | null,
  isPublished: false,
  publicSlug: null as string | null,
};

// ── Store ────────────────────────────────────────────────────

export const useResumeEditorStore = create<ResumeEditorState>()(
  immer((set) => ({
    ...initialState,

    // ── Hydrate from API response ──

    setResume: (resumeId, title, data, templateId, isPublished, publicSlug) =>
      set((state) => {
        state.resumeId = resumeId;
        state.title = title;
        state.data = data;
        state.templateId = templateId || "pixel";
        state.sectionOrder = data.sectionOrder || [
          ...initialState.sectionOrder,
        ];
        state.isDirty = false;
        state.isSaving = false;
        state.saveError = null;
        state.isPublished = isPublished ?? false;
        state.publicSlug = publicSlug ?? null;
      }),

    // ── Data mutations ──

    setData: (data) =>
      set((state) => {
        state.data = data;
        state.isDirty = true;
      }),

    setTemplate: (templateId) =>
      set((state) => {
        state.templateId = templateId;
        state.isDirty = true;
      }),

    setActiveSection: (section) =>
      set((state) => {
        state.activeSection = section;
        // No isDirty — navigation only
      }),

    updateSection: (sectionKey, value) =>
      set((state) => {
        if (!state.data) return;
        // Use type assertion to handle the generic assignment
        (state.data as Record<string, unknown>)[sectionKey as string] = value;
        state.isDirty = true;
      }),

    addItem: (sectionKey, item) =>
      set((state) => {
        if (!state.data) return;
        const section = (state.data as Record<string, unknown>)[sectionKey];
        if (Array.isArray(section)) {
          section.push(item);
          state.isDirty = true;
        }
      }),

    removeItem: (sectionKey, itemId) =>
      set((state) => {
        if (!state.data) return;
        const section = (state.data as Record<string, unknown>)[sectionKey];
        if (Array.isArray(section)) {
          const idx = section.findIndex(
            (item: Record<string, unknown>) => item.id === itemId
          );
          if (idx !== -1) {
            section.splice(idx, 1);
            state.isDirty = true;
          }
        }
      }),

    reorderItems: (sectionKey, activeId, overId) =>
      set((state) => {
        if (!state.data) return;
        const section = (state.data as Record<string, unknown>)[sectionKey];
        if (!Array.isArray(section)) return;

        const activeIdx = section.findIndex(
          (item: Record<string, unknown>) => item.id === activeId
        );
        const overIdx = section.findIndex(
          (item: Record<string, unknown>) => item.id === overId
        );
        if (activeIdx === -1 || overIdx === -1) return;

        const [removed] = section.splice(activeIdx, 1);
        section.splice(overIdx, 0, removed);
        state.isDirty = true;
      }),

    reorderSections: (nextOrder) =>
      set((state) => {
        state.sectionOrder = nextOrder;
        if (state.data) {
          state.data.sectionOrder = nextOrder;
        }
        state.isDirty = true;
      }),

    // ── Save tracking ──

    markSaving: () =>
      set((state) => {
        state.isSaving = true;
        state.saveError = null;
      }),

    markSaved: () =>
      set((state) => {
        state.isSaving = false;
        state.isDirty = false;
        state.saveError = null;
        state.lastSavedAt = new Date().toISOString();
      }),

    markSaveFailed: (message) =>
      set((state) => {
        state.isSaving = false;
        state.saveError = message;
      }),

    // ── Publish state ──

    setPublished: (isPublished, slug) =>
      set((state) => {
        state.isPublished = isPublished;
        state.publicSlug = slug;
      }),

    // ── Reset ──

    reset: () => set(() => ({ ...initialState })),
  }))
);
