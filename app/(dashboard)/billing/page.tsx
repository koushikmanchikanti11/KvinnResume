import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/pixel/page-header";
import { PixelCard } from "@/components/ui/pixel/pixel-card";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance, plan, monthly_parse_count, billing_cycle_start, billing_cycle_end")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Billing & Credits"
        description="Manage your subscription plan, view credit usage, and download invoices."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <PixelCard className="col-span-1 p-6">
          <div className="text-[10px] font-jetbrains tracking-wider uppercase text-kv-text-muted mb-4">
            Current Plan
          </div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-kv-text-primary capitalize">
              {profile?.plan || "Free"} Plan
            </h2>
            <span className="text-[12px] text-kv-text-secondary bg-kv-surface-2 px-2 py-1 rounded border border-kv-border-soft">
              Active
            </span>
          </div>
          <p className="text-[13px] text-kv-text-secondary mb-8">
            Renews on {profile?.billing_cycle_end ? new Date(profile.billing_cycle_end).toLocaleDateString() : "Next Month"}
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-[13px] text-kv-text-primary">
              <span className="text-kv-accent-green">✓</span> PDF Exports Included
            </div>
            <div className="flex items-center gap-3 text-[13px] text-kv-text-primary">
              <span className="text-kv-accent-green">✓</span> Basic Templates
            </div>
            {profile?.plan === 'premium' ? (
              <div className="flex items-center gap-3 text-[13px] text-kv-text-primary">
                <span className="text-kv-accent-green">✓</span> Advanced Parsing
              </div>
            ) : (
              <div className="flex items-center gap-3 text-[13px] text-kv-text-secondary">
                <span className="text-kv-text-muted">✗</span> Advanced Parsing (Pro only)
              </div>
            )}
          </div>

          <Button className="w-full h-9 bg-kv-surface-2 text-kv-text-primary border border-kv-border-soft hover:bg-kv-surface-4 text-[13px]">
            {profile?.plan === 'premium' ? "Manage Subscription" : "Upgrade to Pro"}
          </Button>
        </PixelCard>

        {/* AI Credits Card */}
        <PixelCard className="col-span-1 p-6 flex flex-col">
          <div className="text-[10px] font-jetbrains tracking-wider uppercase text-kv-text-muted mb-4">
            AI Credits Balance
          </div>
          <div className="text-[48px] font-bold leading-none tracking-[-0.06em] text-kv-text-primary font-mono mb-2">
            {profile?.credits_balance?.toLocaleString() || "0"}
          </div>
          <p className="text-[13px] text-kv-text-secondary mb-8">
            Used for AI rewrites, cover letter generation, and parsing.
          </p>

          {/* Usage bar */}
          <div className="w-full bg-kv-surface-2 h-2 rounded-full mb-2 overflow-hidden border border-kv-border-soft">
             <div className="bg-kv-accent-amber h-full rounded-full" style={{ width: "35%" }} />
          </div>
          <div className="flex justify-between text-[11px] font-jetbrains text-kv-text-muted mb-8">
             <span>350 used</span>
             <span>1,000 total</span>
          </div>

          <div className="mt-auto">
            <Button className="w-full h-9 bg-[rgba(231,197,154,0.1)] hover:bg-[rgba(231,197,154,0.15)] text-kv-accent-amber border border-[rgba(231,197,154,0.2)] text-[13px] font-medium transition-colors">
              Buy More Credits
            </Button>
          </div>
        </PixelCard>

        {/* Usage History */}
        <PixelCard className="col-span-1 md:col-span-2 p-6">
          <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-kv-text-primary mb-6">
            Recent Usage
          </h3>
          
          <div className="rounded-lg border border-kv-border-soft overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-kv-surface-2 border-b border-kv-border-soft text-[11px] font-jetbrains text-kv-text-muted uppercase tracking-wider">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Action</th>
                  <th className="p-3 font-medium text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                <tr className="border-b border-kv-border-soft/50 hover:bg-kv-surface-4/30 transition-colors">
                  <td className="p-3 text-kv-text-secondary">May 11, 2026</td>
                  <td className="p-3 text-kv-text-primary">Resume parse (LlamaParse)</td>
                  <td className="p-3 text-right font-mono text-kv-accent-amber">-30</td>
                </tr>
                <tr className="border-b border-kv-border-soft/50 hover:bg-kv-surface-4/30 transition-colors">
                  <td className="p-3 text-kv-text-secondary">May 11, 2026</td>
                  <td className="p-3 text-kv-text-primary">AI bullet rewrite (nano 3)</td>
                  <td className="p-3 text-right font-mono text-kv-accent-amber">-4</td>
                </tr>
                <tr className="hover:bg-kv-surface-4/30 transition-colors">
                  <td className="p-3 text-kv-text-secondary">May 10, 2026</td>
                  <td className="p-3 text-kv-text-primary">AI Cover Letter Generation</td>
                  <td className="p-3 text-right font-mono text-kv-accent-amber">-15</td>
                </tr>
              </tbody>
            </table>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}
