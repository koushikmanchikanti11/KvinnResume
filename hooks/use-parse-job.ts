"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type ParseJobStatus = "idle" | "pending" | "running" | "completed" | "failed" | "cancelled";

interface UseParseJobReturn {
  startParse: (fileId: string, mode: string) => Promise<void>;
  status: ParseJobStatus;
  progress: number;
  label: string;
  error: string | null;
  resumeId: string | null;
  cancel: () => Promise<void>;
  reset: () => void;
}

const STATUS_MAP: Record<string, { progress: number; label: string }> = {
  idle:              { progress: 0,   label: "" },
  pending:           { progress: 15,  label: "UPLOADING_RESUME..." },
  running:           { progress: 50,  label: "PARSING_RESUME..." },
  completed:         { progress: 90,  label: "PARSE_COMPLETE" },
  redirecting:       { progress: 100, label: "REDIRECTING..." },
  failed:            { progress: 0,   label: "PARSE_FAILED" },
  cancelled:         { progress: 0,   label: "CANCELLED" },
};

export function useParseJob(): UseParseJobReturn {
  const [status, setStatus] = useState<ParseJobStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);

  const jobIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorRetryCount = useRef(0);

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  const pollStatus = useCallback(async () => {
    const jobId = jobIdRef.current;
    if (!jobId) return;

    try {
      const res = await fetch(`/api/parse/status?jobId=${jobId}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          clearPolling();
          jobIdRef.current = null;
          errorRetryCount.current = 0;
          setStatus("failed");
          setError(res.status === 404 ? "Job not found. Please try again." : "Session expired. Please refresh.");
          return;
        }
        if (res.status >= 500) {
          errorRetryCount.current += 1;
          if (errorRetryCount.current >= 2) {
            clearPolling();
            jobIdRef.current = null;
            errorRetryCount.current = 0;
            setStatus("failed");
            setError("Server error. Please try again.");
          }
          return;
        }
        return;
      }
      
      // Reset retry counter on success
      errorRetryCount.current = 0;

      const data = await res.json();
      const serverStatus = data.status as string;

      // Map server statuses to our local statuses
      if (serverStatus === "pending") {
        setStatus("pending");
      } else if (serverStatus === "running") {
        setStatus("running");
      } else if (serverStatus === "completed") {
        clearPolling();
        setStatus("completed");

        // Fetch the result to get the resumeId
        try {
          const resultRes = await fetch(`/api/parse/result/${jobId}`);
          if (resultRes.ok) {
            const resultData = await resultRes.json();
            if (resultData.resumeId) {
              setResumeId(resultData.resumeId);
            }
          }
        } catch {
          // Result fetch failed but parse itself completed
        }
      } else if (
        serverStatus === "failed" ||
        serverStatus === "structure_failed"
      ) {
        clearPolling();
        setStatus("failed");
        setError(data.error || "Parse failed. Please try again.");
      } else if (serverStatus === "cancelled") {
        clearPolling();
        setStatus("cancelled");
      }
    } catch (err) {
      errorRetryCount.current += 1;
      if (errorRetryCount.current >= 3) {
        clearPolling();
        jobIdRef.current = null;
        errorRetryCount.current = 0;
        setStatus("failed");
        setError("Connection lost. Please check your network and try again.");
      }
    }
  }, [clearPolling]);

  const startParse = useCallback(
    async (fileId: string, mode: string) => {
      // Reset state
      setError(null);
      setResumeId(null);
      setStatus("pending");
      errorRetryCount.current = 0;
      clearPolling();

      try {
        const res = await fetch("/api/parse/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId, mode }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to start parsing");
        }

        const data = await res.json();
        jobIdRef.current = data.jobId;

        setStatus("running");

        // Start polling every 3 seconds
        intervalRef.current = setInterval(pollStatus, 3000);
      } catch (err: any) {
        setStatus("failed");
        setError(err.message || "Failed to start parsing");
      }
    },
    [clearPolling, pollStatus]
  );

  const cancel = useCallback(async () => {
    clearPolling();
    const jobId = jobIdRef.current;
    if (!jobId) return;

    try {
      await fetch("/api/parse/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
    } catch {
      // best effort
    }

    setStatus("idle");
    setError(null);
    setResumeId(null);
    jobIdRef.current = null;
    errorRetryCount.current = 0;
  }, [clearPolling]);

  const reset = useCallback(() => {
    clearPolling();
    setStatus("idle");
    setError(null);
    setResumeId(null);
    jobIdRef.current = null;
    errorRetryCount.current = 0;
  }, [clearPolling]);

  const mapped = STATUS_MAP[status] ?? STATUS_MAP.idle;

  return {
    startParse,
    status,
    progress: mapped.progress,
    label: mapped.label,
    error,
    resumeId,
    cancel,
    reset,
  };
}
