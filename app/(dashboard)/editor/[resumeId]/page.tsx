"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Editor components
import { EditorTopbar } from "@/components/editor/editor-topbar";
import { EditorShell } from "@/components/editor/editor-shell";
import { SectionTree } from "@/components/editor/section-tree";
import { FormPanel } from "@/components/editor/form-panel";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { PublishModal } from "@/components/editor/publish-modal";

// Store & Schema
import { useResumeEditorStore } from "@/stores/resume-editor";
import { normalizeResumeData } from "@/lib/resume/schema";

export default function EditorPage({ params }: { params: Promise<{ resumeId: string }> }) {
  const resolvedParams = use(params);
  const resumeId = resolvedParams.resumeId;
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<"sections" | "edit" | "preview" | "ai">("sections");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Zustand Store
  const {
    data: resumeJson,
    title: resumeTitle,
    templateId,
    activeSection,
    isDirty,
    isSaving,
    saveError,
    lastSavedAt,
    isPublished,
    publicSlug,
    setResume,
    setActiveSection,
    setData,
    setTemplate,
    markSaving,
    markSaved,
    markSaveFailed,
    setPublished,
    reset,
  } = useResumeEditorStore();

  // 1. Initial Load & Hydration
  useEffect(() => {
    async function loadResume() {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const { resume } = await res.json();
        
        // Normalize whatever comes from the DB into a valid ResumeData object
        const safeData = normalizeResumeData(resume.resume_json);
        
        setResume(
          resumeId,
          resume.title || "Untitled Resume",
          safeData,
          resume.theme || "pixel",
          resume.published || false,
          resume.slug || null
        );
      } catch (err) {
        console.error("Failed to load resume:", err);
        router.push("/dashboard/resumes");
      } finally {
        setIsLoading(false);
      }
    }

    loadResume();
    return () => reset(); // Cleanup on unmount
  }, [resumeId, router, setResume, reset]);

  // 2. Auto-Save Mechanism (2s debounce)
  useEffect(() => {
    if (!isDirty || !resumeId || !resumeJson) return;

    const saveTimer = setTimeout(async () => {
      try {
        markSaving();
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_json: resumeJson,
            theme: templateId,
          }),
        });

        if (!res.ok) throw new Error("Save failed");
        
        markSaved();
      } catch (err) {
        console.error("Auto-save failed:", err);
        markSaveFailed("Save failed");
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [isDirty, resumeJson, templateId, resumeId, markSaving, markSaved, markSaveFailed]);

  // 3. Manual Save (Ctrl/Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        
        if (isDirty && resumeId && resumeJson) {
          markSaving();
          fetch(`/api/resumes/${resumeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume_json: resumeJson,
              theme: templateId,
            }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Save failed");
              markSaved();
            })
            .catch(() => markSaveFailed("Save failed"));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, resumeId, resumeJson, templateId, markSaving, markSaved, markSaveFailed]);

  // 4. Handlers
  const handleAIRequest = (feature: string, context: unknown) => {
    console.log("[Editor] AI Request triggered:", feature, context);
    alert(`AI feature '${feature}' will be implemented soon!`);
  };

  const handleManualSave = () => {
    if (!isDirty || !resumeId || !resumeJson) return;
    markSaving();
    fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_json: resumeJson,
        theme: templateId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Save failed");
        markSaved();
      })
      .catch(() => markSaveFailed("Save failed"));
  };

  if (isLoading || !resumeJson) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040506]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[#e7c59a] animate-spin" />
          <span className="text-[#6a6b6c] text-sm font-mono tracking-widest uppercase">
            Loading Editor...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#040506]">
      <EditorTopbar
        resumeTitle={resumeTitle}
        isDirty={isDirty}
        isSaving={isSaving}
        saveError={saveError}
        lastSavedAt={lastSavedAt}
        resumeId={resumeId}
        isPublished={isPublished}
        onPreview={() => setMobileTab("preview")}
        onDownloadPDF={() => alert("PDF export coming soon!")}
        onCopyLink={async () => {
          if (publicSlug) {
            await navigator.clipboard.writeText(`${window.location.origin}/r/${publicSlug}`);
            alert("Link copied!");
          }
        }}
        onPublish={() => setIsPublishModalOpen(true)}
        onManualSave={handleManualSave}
      />

      <EditorShell
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
        sectionTree={
          <SectionTree
            resumeJson={resumeJson}
            activeSection={activeSection}
            onSectionClick={(section) => {
              setActiveSection(section);
              if (window.innerWidth < 768) setMobileTab("edit");
            }}
          />
        }
        formPanel={
          <FormPanel
            resumeJson={resumeJson}
            activeSection={activeSection}
            onChange={setData}
            onAIRequest={handleAIRequest}
          />
        }
        previewPanel={
          <PreviewPanel
            resumeJson={resumeJson}
            resumeId={resumeId}
            selectedTheme={templateId}
            onThemeChange={setTemplate}
            isPublished={isPublished}
            publicSlug={publicSlug}
          />
        }
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onOpenChange={setIsPublishModalOpen}
        resumeId={resumeId}
        isPublished={isPublished}
        publicSlug={publicSlug}
        onPublishSuccess={(slug) => setPublished(true, slug)}
        onUnpublishSuccess={() => setPublished(false, null)}
      />
    </div>
  );
}
