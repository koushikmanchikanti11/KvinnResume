import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/pixel/page-header";
import { PixelCard } from "@/components/ui/pixel/pixel-card";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Settings"
        description="Configure your dashboard preferences and defaults."
      />

      <div className="flex flex-col gap-6 max-w-3xl">
        <PixelCard className="p-6">
          <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-kv-text-primary mb-6 border-b border-kv-border-soft pb-4">
            Preferences
          </h3>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-kv-text-primary">Theme</div>
                <div className="text-[13px] text-kv-text-secondary">Select your dashboard color scheme.</div>
              </div>
              <select className="bg-kv-surface-2 border border-kv-border-soft text-kv-text-primary text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-kv-accent-violet">
                <option value="system">System</option>
                <option value="dark">Obsidian Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-kv-text-primary">Default Resume Visibility</div>
                <div className="text-[13px] text-kv-text-secondary">Visibility applied to new resumes automatically.</div>
              </div>
              <select className="bg-kv-surface-2 border border-kv-border-soft text-kv-text-primary text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-kv-accent-violet">
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-kv-text-primary">AI Writing Tone</div>
                <div className="text-[13px] text-kv-text-secondary">How AI should rewrite your bullet points.</div>
              </div>
              <select className="bg-kv-surface-2 border border-kv-border-soft text-kv-text-primary text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-kv-accent-violet">
                <option value="professional">Professional</option>
                <option value="startup">Startup / Direct</option>
                <option value="academic">Academic</option>
              </select>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}
