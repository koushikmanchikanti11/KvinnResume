import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { FileTable } from "@/components/files/file-table";
import { UploadFileDialog } from "@/components/files/upload-file-dialog";

type FilesPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  const query = params?.q?.trim() ?? "";
  const status = params?.status ?? "all";

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
        {/* Header */}
        <section className="flex flex-col gap-4">
          <div>
            <p className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
              FILE_WORKSPACE
            </p>

            <h1 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-kv-text-primary sm:text-[32px]">
              Source Files
            </h1>

            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-kv-text-muted">
              Upload resumes, choose parser mode, track parsing progress, and
              inspect structured JSON extracted from your documents.
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <form
              action="/dashboard/files"
              className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_150px]"
            >
              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kv-text-muted" />

                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search files..."
                  className="h-10 w-full rounded-lg border border-kv-border-soft bg-kv-surface-2 pl-10 pr-3 text-[13px] text-kv-text-primary outline-none transition-colors placeholder:text-kv-text-disabled focus:border-kv-border-mid"
                />
              </div>

              <select
                name="status"
                defaultValue={status}
                className="h-10 rounded-lg border border-kv-border-soft bg-kv-surface-2 px-3 font-jetbrains text-[11px] uppercase tracking-[0.1em] text-kv-text-secondary outline-none transition-colors focus:border-kv-border-mid"
              >
                <option value="all">All</option>
                <option value="idle">Idle</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </form>

            <div className="shrink-0 lg:w-auto">
              <UploadFileDialog plan={profile?.plan} />
            </div>
          </div>
        </section>

        <FileTable search={query} status={status} plan={profile?.plan} />
      </div>
    </div>
  );
}