"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Plus, ReceiptText } from "lucide-react";

type PlanName = "free" | "pro" | "premium" | string;

interface CreditsUsageCardProps {
  userId: string;
  onBuyCredits?: () => void;
  onViewUsage?: () => void;
}

interface ProfileRow {
  credits_balance: number | null;
  plan: PlanName | null;
}

interface CreditLedgerRow {
  amount: number;
  reason: string | null;
  created_at: string;
}

interface CreditStats {
  balance: number;
  plan: PlanName;
  usedThisMonth: number;
  addedThisMonth: number;
  totalThisPeriod: number;
  usageItems: CreditLedgerRow[];
}

function getPlanBaseCredits(plan: PlanName | null) {
  if (plan === "premium") return 2000;
  if (plan === "pro") return 1000;
  return 50;
}

function getPlanLabel(plan: PlanName | null) {
  if (plan === "premium") return "Premium";
  if (plan === "pro") return "Pro";
  return "Free";
}

function getProgressColor(percentage: number) {
  if (percentage <= 20) return "#ff6363";
  if (percentage <= 50) return "#e7c59a";
  return "#00ac5c";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function getUsageReasonLabel(reason: string | null) {
  if (!reason) return "Credit activity";

  const normalized = reason.replaceAll("_", " ").trim();

  if (!normalized) return "Credit activity";

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function CreditsUsageCard({
  userId,
  onBuyCredits,
  onViewUsage,
}: CreditsUsageCardProps) {
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCredits() {
      setLoading(true);

      const supabase = createClient();

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("credits_balance, plan")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        console.error("Failed to fetch credit profile:", profileError.message);
        setStats(null);
        setLoading(false);
        return;
      }

      const profile = (profileData as ProfileRow | null) ?? null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: ledgerData, error: ledgerError } = await supabase
        .from("credits_ledger")
        .select("amount, reason, created_at")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(5);

      if (!mounted) return;

      if (ledgerError) {
        console.error("Failed to fetch credit ledger:", ledgerError.message);
      }

      const ledgerRows = ((ledgerData ?? []) as CreditLedgerRow[]).filter(
        (item) => typeof item.amount === "number"
      );

      const balance = profile?.credits_balance ?? 0;
      const plan = profile?.plan ?? "free";

      const usedThisMonth = ledgerRows
        .filter((item) => item.amount < 0)
        .reduce((sum, item) => sum + Math.abs(item.amount), 0);

      const addedThisMonth = ledgerRows
        .filter((item) => item.amount > 0)
        .reduce((sum, item) => sum + item.amount, 0);

      const baseCredits = getPlanBaseCredits(plan);

      const totalThisPeriod = Math.max(
        baseCredits,
        balance + usedThisMonth,
        balance,
        1
      );

      setStats({
        balance,
        plan,
        usedThisMonth,
        addedThisMonth,
        totalThisPeriod,
        usageItems: ledgerRows.slice(0, 3),
      });

      setLoading(false);
    }

    fetchCredits();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const progressPercentage = useMemo(() => {
    if (!stats) return 0;

    return Math.max(
      0,
      Math.min(100, (stats.balance / stats.totalThisPeriod) * 100)
    );
  }, [stats]);

  if (loading) {
    return <CreditsUsageSkeleton />;
  }

  const balance = stats?.balance ?? 0;
  const usedThisMonth = stats?.usedThisMonth ?? 0;
  const addedThisMonth = stats?.addedThisMonth ?? 0;
  const totalThisPeriod = stats?.totalThisPeriod ?? 1;
  const plan = stats?.plan ?? "free";
  const progressColor = getProgressColor(progressPercentage);

  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[14px] flex items-center justify-between gap-3">
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#454647",
            textTransform: "uppercase",
          }}
        >
          AI CREDITS
        </div>

        <span
          style={{
            height: "22px",
            padding: "0 8px",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "6px",
            background: "#1b1c1e",
            border: "1px solid rgba(255,255,255,0.06)",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "11px",
            color: "#9c9c9d",
          }}
        >
          {getPlanLabel(plan)}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              lineHeight: 0.95,
              color: "#f3f3f3",
            }}
          >
            {formatNumber(balance)}
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "13px",
              color: "#6a6b6c",
            }}
          >
            credits available
          </div>
        </div>

        <div
          className="shrink-0 text-right"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "11px",
            color: "#6a6b6c",
          }}
        >
          <div>{Math.round(progressPercentage)}%</div>
          <div>remaining</div>
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          width: "100%",
          height: "7px",
          background: "#1b1c1e",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPercentage}%`,
            height: "100%",
            background: progressColor,
            borderRadius: "999px",
            transition: "width 300ms ease, background-color 300ms ease",
          }}
        />
      </div>

      <div
        className="mt-[10px] flex items-center justify-between gap-3"
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "11px",
          color: "#6a6b6c",
        }}
      >
        <span>{formatNumber(balance)} left</span>
        <span>/ {formatNumber(totalThisPeriod)}</span>
      </div>

      <div
        className="mt-[14px] grid grid-cols-2 gap-2"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: "14px",
        }}
      >
        <MiniMetric
          label="USED"
          value={formatNumber(usedThisMonth)}
          icon={<CreditCard size={13} />}
        />

        <MiniMetric
          label="ADDED"
          value={formatNumber(addedThisMonth)}
          icon={<Plus size={13} />}
        />
      </div>

      {stats && stats.usageItems.length > 0 && (
        <div
          className="mt-[14px]"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: "12px",
          }}
        >
          <div
            className="mb-[8px]"
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: "10px",
              color: "#454647",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            RECENT ACTIVITY
          </div>

          <div className="flex flex-col gap-[7px]">
            {stats.usageItems.map((item, index) => (
              <div
                key={`${item.created_at}-${index}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-[7px]">
                  <ReceiptText
                    size={13}
                    style={{
                      color: "#6a6b6c",
                      flexShrink: 0,
                    }}
                  />

                  <span
                    className="truncate"
                    style={{
                      fontSize: "12px",
                      color: "#9c9c9d",
                    }}
                  >
                    {getUsageReasonLabel(item.reason)}
                  </span>
                </div>

                <div
                  className="shrink-0 text-right"
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "11px",
                    color: item.amount < 0 ? "#ff6363" : "#00ac5c",
                  }}
                >
                  {item.amount > 0 ? "+" : ""}
                  {item.amount}
                  <span
                    style={{
                      marginLeft: "6px",
                      color: "#454647",
                    }}
                  >
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="mt-[14px] flex gap-2"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: "14px",
        }}
      >
        <button
          type="button"
          onClick={onBuyCredits}
          disabled={!onBuyCredits}
          className="inline-flex flex-1 items-center justify-center gap-[6px]"
          style={{
            height: "34px",
            padding: "0 12px",
            borderRadius: "8px",
            border: "none",
            background: "#e6e6e6",
            color: "#2f3031",
            fontSize: "13px",
            fontWeight: 500,
            cursor: onBuyCredits ? "pointer" : "not-allowed",
            opacity: onBuyCredits ? 1 : 0.4,
            boxShadow:
              "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <Plus size={13} />
          Buy
        </button>

        <button
          type="button"
          onClick={onViewUsage}
          disabled={!onViewUsage}
          className="inline-flex flex-1 items-center justify-center"
          style={{
            height: "34px",
            padding: "0 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "transparent",
            color: "#9c9c9d",
            fontSize: "13px",
            fontWeight: 500,
            cursor: onViewUsage ? "pointer" : "not-allowed",
            opacity: onViewUsage ? 1 : 0.4,
          }}
        >
          Usage
        </button>
      </div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "52px",
        padding: "9px 10px",
        background: "#1b1c1e",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "8px",
      }}
    >
      <div
        className="flex items-center gap-[6px]"
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "10px",
          color: "#454647",
          letterSpacing: "0.06em",
        }}
      >
        <span
          style={{
            color: "#6a6b6c",
            display: "inline-flex",
          }}
        >
          {icon}
        </span>
        {label}
      </div>

      <div
        style={{
          marginTop: "5px",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "14px",
          fontWeight: 600,
          color: "#f3f3f3",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CreditsUsageSkeleton() {
  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[14px] flex items-center justify-between">
        <SkeletonBlock width="72px" height="10px" />
        <SkeletonBlock width="58px" height="22px" radius="6px" />
      </div>

      <SkeletonBlock width="100px" height="40px" />
      <div style={{ marginTop: "8px" }}>
        <SkeletonBlock width="120px" height="13px" />
      </div>

      <div style={{ marginTop: "16px" }}>
        <SkeletonBlock width="100%" height="7px" radius="999px" />
      </div>

      <div className="mt-[14px] grid grid-cols-2 gap-2">
        <SkeletonBlock width="100%" height="52px" radius="8px" />
        <SkeletonBlock width="100%" height="52px" radius="8px" />
      </div>

      <div className="mt-[14px] flex gap-2">
        <SkeletonBlock width="100%" height="34px" radius="8px" />
        <SkeletonBlock width="100%" height="34px" radius="8px" />
      </div>
    </section>
  );
}

function SkeletonBlock({
  width,
  height,
  radius = "4px",
}: {
  width: string;
  height: string;
  radius?: string;
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#1b1c1e",
      }}
    />
  );
}

export default CreditsUsageCard;