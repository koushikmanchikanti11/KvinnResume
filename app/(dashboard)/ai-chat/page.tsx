import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/pixel/page-header";

export default async function AiChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">
      <div className="flex-shrink-0">
        <PageHeader 
          title="AI Resume Chat"
          icon={<Sparkles className="w-5 h-5 text-kv-accent-violet" />}
          description="Ask for feedback, improvements, or cover letter drafts."
          action={
            <select className="bg-kv-surface-2 border border-kv-border-soft text-kv-text-primary text-[12px] rounded-lg px-3 py-2 h-9 focus:outline-none focus:border-kv-accent-violet">
              <option value="minimax">nano 2.5</option>
              <option value="qwen">nano 3</option>
            </select>
          }
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 border border-kv-border-soft rounded-xl bg-kv-surface-3 overflow-hidden flex flex-col relative max-w-[1000px] w-full mx-auto shadow-md">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Greeting message */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[rgba(141,107,255,0.1)] border border-[rgba(141,107,255,0.2)] flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-kv-accent-violet" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-kv-text-primary mb-1">Kvinn AI</div>
              <div className="text-[14px] text-kv-text-secondary leading-relaxed bg-kv-surface-2 p-4 rounded-xl rounded-tl-none border border-kv-border-soft max-w-2xl">
                Hello! I can help you improve your resume. I can rewrite bullets, check ATS compatibility, or generate a tailored cover letter. What would you like to do?
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-kv-surface-2 border-t border-kv-border-soft">
          <div className="relative max-w-4xl mx-auto">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="w-full bg-kv-surface-1 border border-kv-border-soft rounded-lg pl-4 pr-12 py-3 text-[14px] text-kv-text-primary focus:outline-none focus:border-kv-accent-violet transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-kv-accent-violet bg-[rgba(141,107,255,0.1)] hover:bg-[rgba(141,107,255,0.2)] rounded-md transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 text-[11px] font-jetbrains text-kv-text-muted text-center flex items-center justify-center gap-4">
            <span>Requires 1 credit per message</span>
            <span>↵ Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
