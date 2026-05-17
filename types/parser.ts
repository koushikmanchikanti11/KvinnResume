// Parser types
export type ParseMode = "nano" | "nano_mini" | "nano_pro" | "auto";

export type ParseStatus = "pending" | "parsing" | "completed" | "failed";

export interface ParseJob {
  id: string;
  fileId: string;
  userId: string;
  mode: ParseMode;
  status: ParseStatus;
  provider: "llamaparse" | "reducto";
  result?: unknown;
  error?: string;
  creditsCost: number;
  createdAt: string;
  completedAt?: string;
}
