import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Upload, MessageSquare, FileText, ArrowUp } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/pixel/page-header";
import { PixelCard } from "@/components/ui/pixel/pixel-card";
import { StatusChip } from "@/components/ui/pixel/status-chip";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Fetch some basic profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, credits_balance, plan, monthly_parse_count")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title={`Good afternoon, ${firstName}.`}
        description="Your resume workspace is ready."
        action={
          <>
            <Link href="/dashboard/ai-chat" className={buttonVariants({ variant: "outline", className: "h-9 font-jetbrains text-[12px] uppercase tracking-wider bg-kv-surface-2 border-kv-border-soft hover:bg-kv-surface-4 text-kv-text-primary" })}>
              <MessageSquare className="w-3.5 h-3.5 mr-2" />
              Ask AI
            </Link>
            <Button variant="outline" className="h-9 font-jetbrains text-[12px] uppercase tracking-wider bg-kv-surface-2 border-kv-border-soft hover:bg-kv-surface-4 text-kv-text-primary">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Create Blank
            </Button>
            <Button className="h-9 bg-kv-cta-bg text-kv-cta-text hover:bg-white font-jetbrains text-[12px] uppercase tracking-wider border-none shadow-[rgba(0,0,0,0.4)_0px_1.5px_0.5px_2.5px,rgb(0,0,0)_0px_0px_0.5px_1px,rgba(0,0,0,0.25)_0px_2px_1px_1px_inset,rgba(255,255,255,0.2)_0px_1px_1px_1px_inset]">
              <Upload className="w-3.5 h-3.5 mr-2" />
              Upload Resume
            </Button>
          </>
        }
      />

      {/* Two-column grid: 60% left, 40% right (Design Spec §6.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
        {/* LEFT COLUMN — Active Resume + Recent Files */}
        <div className="flex flex-col gap-5">
          {/* Active Resume Card */}
          <PixelCard className="flex flex-col group p-5">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-kv-text-primary mb-1">
                  Frontend Developer
                </h3>
                <p className="text-[13px] text-kv-text-muted">Target Role</p>
              </div>
              {/* Resume mini thumbnail */}
              <div className="w-[68px] h-[88px] bg-[#f7f7f2] rounded flex-shrink-0 relative overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] group-hover:-translate-y-0.5 transition-transform">
                <div className="absolute top-3 left-2 w-8 h-1 bg-[#d0d0d0] rounded" />
                <div className="absolute top-5 left-2 w-10 h-0.5 bg-[#e0e0e0] rounded" />
                <div className="absolute top-6.5 left-2 w-10 h-0.5 bg-[#e0e0e0] rounded" />
                <div className="absolute top-8 left-2 w-8 h-0.5 bg-[#e0e0e0] rounded" />
                <div className="absolute top-10 left-2 w-10 h-0.5 bg-[#e0e0e0] rounded" />
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button size="sm" className="flex-1 bg-kv-cta-bg text-kv-cta-text hover:bg-white h-[34px] text-[13px] font-medium transition-colors border-none shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]">
                  Open Editor
                </Button>
                <Button size="sm" variant="outline" className="bg-kv-surface-3 text-kv-text-primary border-kv-border-mid hover:bg-kv-surface-4 h-[34px] text-[13px] font-medium transition-colors">
                  Preview
                </Button>
              </div>
              <div className="flex justify-between items-center text-[12px] font-jetbrains text-kv-text-muted">
                <span>Edited 2h ago</span>
                <StatusChip status="published" label="Published" className="bg-transparent border-none p-0" />
              </div>
            </div>
          </PixelCard>

          {/* Recent Files Card */}
          <PixelCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-kv-text-primary">
                Recent Files
              </h3>
              <Link href="/files" className="text-[13px] text-kv-accent-violet hover:text-kv-text-primary transition-colors">
                View all →
              </Link>
            </div>
            <div className="flex flex-col">
              {[
                { name: "resume_kiran.pdf", mode: "Parsed", pages: 2, time: "2m ago", status: "success" as const },
                { name: "jd_frontend.txt", mode: "Ready", pages: 1, time: "1h ago", status: "neutral" as const },
                { name: "portfolio.pdf", mode: "Failed", pages: 6, time: "yesterday", status: "error" as const },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-1 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors rounded-lg group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-kv-surface-4 border border-kv-border-soft flex items-center justify-center">
                      <FileText className="w-4 h-4 text-kv-text-muted" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-kv-text-primary">{f.name}</div>
                      <div className="text-[12px] text-kv-text-muted font-jetbrains mt-0.5">{f.pages} page{f.pages > 1 ? 's' : ''} • {f.time}</div>
                    </div>
                  </div>
                  <StatusChip status={f.status} label={f.mode} />
                </div>
              ))}
            </div>
          </PixelCard>
        </div>

        {/* RIGHT COLUMN — ATS Score + Credits + AI Suggestions */}
        <div className="flex flex-col gap-5">
          {/* ATS Score Card */}
          <PixelCard className="flex flex-col p-5">
            <div>
              <div className="text-[10px] font-jetbrains tracking-wider uppercase text-kv-text-disabled mb-2">
                ATS Score
              </div>
              <div className="flex items-end gap-3">
                <div className="text-[40px] font-bold leading-none tracking-[-0.06em] text-kv-accent-green font-mono">
                  89
                </div>
                <div className="text-[20px] font-normal leading-none text-kv-text-muted mb-1 font-mono">
                  / 100
                </div>
              </div>
              <div className="text-[12px] text-kv-accent-green mt-3 flex items-center gap-1 font-medium">
                <ArrowUp className="w-3 h-3" /> +12 since last edit
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-1.5">
              {[
                { label: "Keywords", ok: true },
                { label: "Section hierarchy", ok: true },
                { label: "Action verbs", ok: true },
                { label: "Measurable results", ok: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 h-7 text-[13px] text-kv-text-secondary">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ color: item.ok ? "#00ac5c" : "#e7c59a" }}
                  >
                    {item.ok ? "✓" : "!"}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </PixelCard>

          {/* Credits Card */}
          <PixelCard className="flex flex-col p-5">
            <div>
              <div className="text-[10px] font-jetbrains tracking-wider uppercase text-kv-text-disabled mb-2">
                AI Credits
              </div>
              <div className="text-[40px] font-bold leading-none tracking-[-0.06em] text-kv-text-primary font-mono">
                {profile?.credits_balance?.toLocaleString() ?? "---"}
              </div>
              <div className="text-[13px] text-kv-text-muted mt-3">
                Next reset: Jun 01
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Button size="sm" variant="outline" className="flex-1 bg-kv-surface-3 border-kv-border-mid hover:bg-kv-surface-4 h-[34px] text-[12px] font-medium text-kv-text-primary">
                View Usage
              </Button>
              <Button size="sm" className="flex-1 bg-[rgba(231,197,154,0.1)] hover:bg-[rgba(231,197,154,0.15)] text-kv-accent-amber border-kv-border-mid border h-[34px] text-[12px] font-medium">
                Buy Credits
              </Button>
            </div>
          </PixelCard>

          {/* AI Suggestions Card */}
          <PixelCard className="p-5">
            <div className="text-[10px] font-jetbrains tracking-wider uppercase text-kv-accent-violet flex items-center gap-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-kv-accent-violet shadow-[0_0_8px_rgba(141,107,255,0.6)] animate-pulse" />
              AI Suggestions
            </div>
            <div className="flex flex-col gap-2">
              {[
                "Improve summary for frontend roles",
                "Add metrics to project bullets",
                "Optimize skills for ATS",
                "Create cover letter from current resume",
              ].map((s, i) => (
                <button key={i} className="text-left py-2.5 px-3 rounded-lg hover:bg-[rgba(141,107,255,0.08)] text-[13px] text-kv-text-secondary hover:text-kv-text-primary transition-all flex items-start gap-2.5">
                  <span className="text-kv-accent-violet mt-0.5 text-[12px]">◆</span>
                  <span className="leading-tight">{s}</span>
                </button>
              ))}
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
}
