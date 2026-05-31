"use client";

import { ChevronDown, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FileStatusFilterProps = {
  value?: string;
};

const filters = [
  { value: "all", label: "All" },
  { value: "idle", label: "Idle" },
  { value: "pending", label: "Pending" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

function getFilterLabel(value?: string) {
  return filters.find((filter) => filter.value === value)?.label || "All";
}

export function FileStatusFilter({ value = "all" }: FileStatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "all") {
      params.delete("status");
    } else {
      params.set("status", nextValue);
    }

    const query = params.toString();
    router.push(query ? `/dashboard/files?${query}` : "/dashboard/files");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        style={{
          width: "100%",
          minWidth: "150px",
          height: "40px",
          borderRadius: "10px",
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#f3f3f3",
          fontFamily: "var(--font-jetbrains), monospace",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          outline: "none",
          cursor: "pointer",
        }}
      >
        <span>{getFilterLabel(value)}</span>
        <ChevronDown className="h-4 w-4" style={{ color: "#6a6b6c" }} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        style={{
          width: "220px",
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "13px",
          padding: "6px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        }}
        className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
      >
        {filters.map((filter) => {
          const selected = value === filter.value || (!value && filter.value === "all");

          return (
            <DropdownMenuItem
              key={filter.value}
              onClick={() => handleChange(filter.value)}
              style={{
                padding: "10px 14px",
                color: selected ? "#f3f3f3" : "#9c9c9d",
                cursor: "pointer",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                background: selected ? "rgba(255,255,255,0.05)" : "transparent",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#f3f3f3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = selected
                  ? "rgba(255,255,255,0.05)"
                  : "transparent";
                e.currentTarget.style.color = selected ? "#f3f3f3" : "#9c9c9d";
              }}
            >
              <span>{filter.label}</span>
              {selected ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}