import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, Eye, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/pixel/page-header";
import { PixelCard } from "@/components/ui/pixel/pixel-card";
import { EmptyState } from "@/components/ui/pixel/empty-state";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Analytics"
        icon={<BarChart3 className="w-6 h-6 text-kv-text-muted" />}
        description="Track views and downloads for your public resumes and profile card."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PixelCard className="col-span-1 p-6">
          <div className="flex items-center gap-2 text-[10px] font-jetbrains tracking-wider uppercase text-kv-text-muted mb-4">
            <Eye className="w-4 h-4" />
            Total Profile Views
          </div>
          <div className="text-[48px] font-bold leading-none tracking-[-0.06em] text-kv-text-primary font-mono">
            0
          </div>
          <div className="text-[12px] text-kv-text-secondary mt-3">
            Last 30 days
          </div>
        </PixelCard>

        <PixelCard className="col-span-1 p-6">
          <div className="flex items-center gap-2 text-[10px] font-jetbrains tracking-wider uppercase text-kv-text-muted mb-4">
            <Download className="w-4 h-4" />
            Resume Downloads
          </div>
          <div className="text-[48px] font-bold leading-none tracking-[-0.06em] text-kv-text-primary font-mono">
            0
          </div>
          <div className="text-[12px] text-kv-text-secondary mt-3">
            Last 30 days
          </div>
        </PixelCard>
      </div>

      <PixelCard className="p-0 border border-kv-border-soft overflow-hidden">
        <EmptyState 
          icon={<BarChart3 className="w-8 h-8" />}
          title="Not enough data"
          description="Publish a resume or complete your profile card to start tracking visitor engagement."
          className="border-none rounded-none min-h-[300px]"
        />
      </PixelCard>
    </div>
  );
}
