# Codebase Memory

## Phase 7: Resume Editor & State Management

**Implemented features:**
- **Canonical Schema (`lib/resume/schema.ts`)**: Defined the single source of truth for `ResumeData` with Zod validation.
- **Zustand Store (`stores/resume-editor.ts`)**: Built the global state manager using Immer for immutable updates. Handles hydration, dirty checking, and save status tracking.
- **API Routes**:
  - `GET /api/resumes`: List user resumes.
  - `POST /api/resumes`: Create blank resume.
  - `GET /api/resumes/[resumeId]`: Fetch single resume.
  - `PATCH /api/resumes/[resumeId]`: Update resume with auto-save target.
  - `DELETE /api/resumes/[resumeId]`: Delete unpublished resumes.
  - `POST /api/resumes/[resumeId]/publish`: Publish resume with plan validation and slug generation.
  - `POST /api/resumes/[resumeId]/unpublish`: Unpublish resume and decrement counts.
- **Editor UI Components (`components/editor/`)**:
  - `EditorTopbar`: Sticky header with save indicator (Saved/Saving/Unsaved/Error).
  - `EditorShell`: Responsive three-panel layout (Sections, Edit, Preview) with mobile tabs.
  - `SectionTree`: Left navigation with completeness status derivation.
  - `FormPanel`: Center router for all field editors.
  - `ThemeSelector`: 4-theme picker in the preview panel.
  - `PublishModal`: Slug configuration and publish workflow.
  - `PreviewPanel`: Structural preview to validate data flow.
- **Field Editors (`components/editor/fields/`)**: 10 editors for basics, summary, experience, education, skills, projects, certifications, achievements, socials, and custom sections. Includes bullet point management and reordering.
- **Editor Page (`app/(dashboard)/editor/[resumeId]/page.tsx`)**: The main page component that ties everything together. Includes 2-second debounced auto-save and Ctrl+S manual save.
- **Redis Cache (`lib/redis/keys.ts`)**: Added `cache:resume-public:{slug}` for the new v3 architecture.

**Technical Decisions:**
- `immer` was installed and configured for Zustand to handle complex nested state mutations.
- The editor escapes the Dashboard layout padding using `position: fixed` for a full-viewport experience.
- The preview panel renders a basic structural HTML preview for now; Phase 8 will inject the real template engine here.
- The `[resumeId]` route parameter was maintained to align with existing project directory structure.
- Resolved strict Supabase TypeScript errors by casting JSONB payloads to `any` in API routes and restructuring RPC `.catch()` chains into robust `try/catch` blocks.
