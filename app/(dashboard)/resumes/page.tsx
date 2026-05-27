import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/pixel/page-header";
import { PixelCard } from "@/components/ui/pixel/pixel-card";
import { EmptyState } from "@/components/ui/pixel/empty-state";

export default async function ResumesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="My Resumes"
        description="Manage your tailored resumes and their publish settings."
        action={
          <>
            <div className="relative">
              <Search className="w-4 h-4 text-kv-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search resumes..." 
                className="h-9 w-64 bg-kv-surface-2 border border-kv-border-soft rounded-lg pl-9 pr-3 text-[13px] text-kv-text-primary focus:outline-none focus:border-kv-border-mid transition-colors"
              />
            </div>
            <Button className="h-9 bg-kv-cta-bg text-kv-cta-text hover:bg-white font-jetbrains text-[12px] uppercase tracking-wider border-none shadow-[rgba(0,0,0,0.4)_0px_1.5px_0.5px_2.5px,rgb(0,0,0)_0px_0px_0.5px_1px,rgba(0,0,0,0.25)_0px_2px_1px_1px_inset,rgba(255,255,255,0.2)_0px_1px_1px_1px_inset]">
              <Plus className="w-3.5 h-3.5 mr-2" />
              New Resume
            </Button>
          </>
        }
      />

      {!resumes || resumes.length === 0 ? (
        <EmptyState 
          icon={<Plus className="w-8 h-8" />}
          title="No resumes yet"
          description="Upload an existing resume or create a blank one to get started with KvinnResume."
          action={
            <Button className="h-9 bg-kv-cta-bg text-kv-cta-text hover:bg-white font-jetbrains text-[12px] uppercase tracking-wider border-none shadow-[rgba(0,0,0,0.4)_0px_1.5px_0.5px_2.5px,rgb(0,0,0)_0px_0px_0.5px_1px,rgba(0,0,0,0.25)_0px_2px_1px_1px_inset,rgba(255,255,255,0.2)_0px_1px_1px_1px_inset]">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Create Blank Resume
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <PixelCard key={resume.id} className="flex flex-col p-6 group">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-kv-text-primary mb-1 line-clamp-1">
                    {resume.title}
                  </h3>
                  <p className="text-[13px] text-kv-text-secondary line-clamp-1">Last edited {new Date(resume.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <Button size="sm" className="flex-1 bg-kv-surface-2 text-kv-text-primary border border-kv-border-soft hover:bg-kv-surface-4 h-9 text-[13px] font-medium transition-colors">
                  Open Editor
                </Button>
              </div>
            </PixelCard>
          ))}
        </div>
      )}
    </div>
  );
}
