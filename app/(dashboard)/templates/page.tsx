import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/pixel/page-header";

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch from the API route we will build
  // For static layout preview, we'll mock it
  
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Templates"
        description="Choose a pixel-perfect design for your resume. Premium templates require Pro."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Placeholder template 1 */}
        <div className="flex flex-col gap-3 group">
          <div className="aspect-[1/1.414] border border-kv-border-soft rounded-lg bg-[#f7f7f2] relative overflow-hidden transition-all group-hover:border-kv-accent-amber shadow-sm">
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button className="h-9 px-6 rounded bg-kv-cta-bg text-kv-cta-text font-jetbrains uppercase text-[12px] shadow-[rgba(0,0,0,0.4)_0px_1.5px_0.5px_2.5px,rgb(0,0,0)_0px_0px_0.5px_1px,rgba(0,0,0,0.25)_0px_2px_1px_1px_inset,rgba(255,255,255,0.2)_0px_1px_1px_1px_inset] border-none transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">Use Template</button>
             </div>
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-kv-text-primary">Pixel OS Standard</h3>
            <p className="text-[12px] text-kv-text-muted">Included in Free</p>
          </div>
        </div>

        {/* Placeholder template 2 */}
        <div className="flex flex-col gap-3 group">
          <div className="aspect-[1/1.414] border border-kv-border-soft rounded-lg bg-[#f7f7f2] relative overflow-hidden transition-all group-hover:border-kv-accent-amber shadow-sm">
             <div className="absolute top-2 right-2 bg-kv-accent-violet text-white text-[10px] font-jetbrains uppercase px-2 py-0.5 rounded shadow-sm z-10">Pro</div>
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button className="h-9 px-6 rounded bg-kv-cta-bg text-kv-cta-text font-jetbrains uppercase text-[12px] shadow-[rgba(0,0,0,0.4)_0px_1.5px_0.5px_2.5px,rgb(0,0,0)_0px_0px_0.5px_1px,rgba(0,0,0,0.25)_0px_2px_1px_1px_inset,rgba(255,255,255,0.2)_0px_1px_1px_1px_inset] border-none transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">Use Template</button>
             </div>
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-kv-text-primary flex items-center gap-1.5">
              Executive Deep
              <span className="text-kv-accent-amber">✦</span>
            </h3>
            <p className="text-[12px] text-kv-text-muted">Requires Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
