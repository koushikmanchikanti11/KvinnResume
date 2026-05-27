export type ParseMode = "nano" | "nano_mini" | "nano_pro" | "auto";

export type ParseStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ParseProvider = "llamaparse" | "reducto";

export interface ParseJob {
  id: string;
  fileId: string;
  userId: string;
  mode: ParseMode;
  status: ParseStatus;
  provider: ParseProvider;
  external_job_id: string | null;
  raw_markdown: string | null;
  raw_text: string | null;
  parsed_items: any[] | null;
  parsed_json: any | null;
  error_message: string | null;
  credits_used: number;
  refunded: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface NormalizedParseResult {
  raw_markdown: string;
  raw_text: string;
  parsed_items: any[];
  metadata: Record<string, any>;
  pages_count: number | null;
}
