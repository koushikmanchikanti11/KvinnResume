// AI types
export interface AIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface AISuggestion {
  id: string;
  type: "rewrite" | "enhance" | "ats" | "format";
  original: string;
  suggested: string;
  section: string;
  accepted?: boolean;
}

export interface ATSScore {
  overall: number;
  keywordDensity: number;
  actionVerbs: number;
  measurableImpact: number;
  formattingSafety: number;
  sectionHierarchy: number;
  readability: number;
  diagnostics: ATSDiagnostic[];
}

export interface ATSDiagnostic {
  category: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  section?: string;
}
