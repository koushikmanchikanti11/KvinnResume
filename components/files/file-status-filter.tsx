"use client";

import { Check, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type FileStatusFilterValue =
  | "all"
  | "idle"
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

interface FileStatusFilterProps {
  value?: FileStatusFilterValue | string;
  paramName?: string;
}

const filters: Array<{
  value: FileStatusFilterValue;
  label: string;
}> = [
  { value: "all", label: "Status" },
  { value: "idle", label: "Idle" },
  { value: "pending", label: "Pending" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

function getFilterLabel(value?: string) {
  return filters.find((filter) => filter.value === value)?.label || "Status";
}

export function FileStatusFilter({
  value = "all",
  paramName = "status",
}: FileStatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(nextValue: FileStatusFilterValue) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, nextValue);
    }

    const query = params.toString();

    router.push(query ? `/files?${query}` : "/files");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        style={{
          height: "36px",
          padding: "0 12px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#9c9c9d",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          minWidth: "124px",
          outline: "none",
          transition: "border-color 160ms ease, color 160ms ease",
          fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          event.currentTarget.style.color = "#f3f3f3";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          event.currentTarget.style.color = "#9c9c9d";
        }}
      >
        <span>{getFilterLabel(value)}</span>
        <ChevronDown size={14} style={{ color: "#6a6b6c" }} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        style={{
          width: "184px",
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "12px",
          padding: "6px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
        }}
      >
        {filters.map((filter) => {
          const selected =
            value === filter.value ||
            (!value && filter.value === "all") ||
            (value === "all" && filter.value === "all");

          return (
            <DropdownMenuItem
              key={filter.value}
              onClick={() => handleChange(filter.value)}
              style={{
                height: "34px",
                padding: "0 10px",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "9px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
                color: selected ? "#f3f3f3" : "#9c9c9d",
                background: selected
                  ? "rgba(255,255,255,0.05)"
                  : "transparent",
                transition: "background 120ms ease, color 120ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  "rgba(255,255,255,0.05)";
                event.currentTarget.style.color = "#f3f3f3";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = selected
                  ? "rgba(255,255,255,0.05)"
                  : "transparent";
                event.currentTarget.style.color = selected
                  ? "#f3f3f3"
                  : "#9c9c9d";
              }}
            >
              <span>{filter.label}</span>

              {selected && (
                <Check
                  size={14}
                  style={{
                    color: "#e7c59a",
                    flexShrink: 0,
                  }}
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default FileStatusFilter;