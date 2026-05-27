import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/pixel/page-header";
import { PixelCard } from "@/components/ui/pixel/pixel-card";
import { StatusChip } from "@/components/ui/pixel/status-chip";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <PageHeader 
        title="Public Profile Card"
        description="Configure your public-facing developer identity."
      />

      <div className="flex flex-col gap-6 max-w-3xl">
        <PixelCard className="p-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-kv-border-soft">
            <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-kv-text-primary">Basic Info</h3>
            {profile?.profile_completed ? (
               <StatusChip status="success" label="Profile Completed" className="bg-transparent" />
            ) : (
               <StatusChip status="neutral" label="Incomplete" className="bg-transparent" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-jetbrains uppercase text-kv-text-muted">Username (URL Slug)</label>
              <input 
                type="text" 
                defaultValue={profile?.username || ""} 
                placeholder="e.g. johndoe"
                className="bg-kv-surface-2 border border-kv-border-soft rounded-lg px-3 py-2 text-[14px] text-kv-text-primary focus:border-kv-accent-amber focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-jetbrains uppercase text-kv-text-muted">Full Name</label>
              <input 
                type="text" 
                defaultValue={profile?.full_name || ""} 
                className="bg-kv-surface-2 border border-kv-border-soft rounded-lg px-3 py-2 text-[14px] text-kv-text-primary focus:border-kv-accent-amber focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-jetbrains uppercase text-kv-text-muted">Professional Role</label>
              <input 
                type="text" 
                defaultValue={profile?.professional_role || ""} 
                placeholder="e.g. Full Stack Developer"
                className="bg-kv-surface-2 border border-kv-border-soft rounded-lg px-3 py-2 text-[14px] text-kv-text-primary focus:border-kv-accent-amber focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-jetbrains uppercase text-kv-text-muted">Location</label>
              <input 
                type="text" 
                defaultValue={profile?.location_city || ""} 
                placeholder="e.g. San Francisco, CA"
                className="bg-kv-surface-2 border border-kv-border-soft rounded-lg px-3 py-2 text-[14px] text-kv-text-primary focus:border-kv-accent-amber focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-8">
            <label className="text-[11px] font-jetbrains uppercase text-kv-text-muted">Bio / Description (Max 500 chars)</label>
            <textarea 
              defaultValue={profile?.description || ""} 
              rows={4}
              className="bg-kv-surface-2 border border-kv-border-soft rounded-lg px-3 py-2 text-[14px] text-kv-text-primary focus:border-kv-accent-amber focus:outline-none resize-none transition-colors"
            />
          </div>

          <Button className="h-9 bg-kv-surface-2 text-kv-text-primary border border-kv-border-soft hover:bg-kv-surface-4 text-[13px] font-medium transition-colors">
            Save Basic Info
          </Button>
        </PixelCard>

        <PixelCard className="p-6">
          <div className="mb-8 pb-4 border-b border-kv-border-soft">
            <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-kv-text-primary mb-1">Social Links</h3>
            <p className="text-[13px] text-kv-text-secondary">Connect your external profiles. At least one is required to publish.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             {['github', 'linkedin', 'portfolio', 'twitter'].map(network => (
               <div key={network} className="flex flex-col gap-2">
                <label className="text-[11px] font-jetbrains uppercase text-kv-text-muted">{network}</label>
                <input 
                  type="url" 
                  placeholder={`https://${network}.com/...`}
                  className="bg-kv-surface-2 border border-kv-border-soft rounded-lg px-3 py-2 text-[14px] text-kv-text-primary focus:border-kv-accent-amber focus:outline-none transition-colors"
                />
              </div>
             ))}
          </div>
          
          <Button className="h-9 bg-kv-surface-2 text-kv-text-primary border border-kv-border-soft hover:bg-kv-surface-4 text-[13px] font-medium transition-colors">
            Save Social Links
          </Button>
        </PixelCard>
      </div>
    </div>
  );
}
