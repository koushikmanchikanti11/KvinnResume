import { ParseStatus } from "@/types/parser";

/**
 * Normalizes LlamaParse v2 status strings to our universal ParseStatus enum.
 * Official LlamaParse statuses: 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'
 */
export function normalizeLlamaParseStatus(rawStatus: string): ParseStatus {
  const s = rawStatus.toUpperCase();
  if (s === "PENDING") return "pending";
  if (s === "RUNNING") return "running";
  if (s === "COMPLETED") return "completed";
  if (s === "FAILED") return "failed";
  if (s === "CANCELLED") return "cancelled";
  
  // Default fallback
  return "pending";
}

/**
 * Normalizes Reducto async status strings to our universal ParseStatus enum.
 * Known Reducto statuses: 'Pending', 'Idle', 'InProgress', 'Completing', 'Completed', 'Failed', 'Cancelled'
 */
export function normalizeReductoStatus(rawStatus: string): ParseStatus {
  const s = rawStatus.toLowerCase();
  
  if (s === "pending" || s === "idle") return "pending";
  if (s === "inprogress" || s === "completing") return "running";
  if (s === "completed") return "completed";
  if (s === "failed") return "failed";
  if (s === "cancelled") return "cancelled";
  
  // Default fallback
  return "pending";
}
