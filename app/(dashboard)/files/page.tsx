import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { FileTable } from "@/components/files/file-table";
import { UploadFileDialog } from "@/components/files/upload-file-dialog";
import { FileStatusFilter } from "@/components/files/file-status-filter";

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
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        {/* Hero / Workspace Header */}
        <section
          className="relative overflow-hidden rounded-[18px] border p-5 sm:p-6 lg:p-7"
          style={{
            background:
              "linear-gradient(180deg, rgba(17,18,20,0.96), rgba(8,9,10,0.96))",
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.28)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(circle at 20% 0%, rgba(231,197,154,0.08), transparent 32%), radial-gradient(circle at 90% 10%, rgba(122,162,255,0.08), transparent 28%)",
            }}
          />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="max-w-2xl">
              <p
                className="font-jetbrains text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "#9c9c9d" }}
              >
                FILE_WORKSPACE
              </p>

              <h1
                className="mt-2 text-[32px] font-bold leading-none tracking-[-0.05em] sm:text-[38px]"
                style={{ color: "#f3f3f3" }}
              >
                Source Files
              </h1>

              <p
                className="mt-4 text-[14px] leading-7 sm:text-[15px]"
                style={{ color: "#9c9c9d" }}
              >
                Upload resumes, choose parser mode, track parsing progress, and
                inspect structured JSON extracted from your documents.
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form action="/dashboard/files" className="flex-1">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "#6a6b6c" }}
                  />

                  <input
                    name="q"
                    defaultValue={query}
                    placeholder="Search files..."
                    className="h-12 w-full rounded-[12px] border pl-11 pr-4 text-[14px] outline-none transition"
                    style={{
                      background: "#0b0c0d",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#f3f3f3",
                    }}
                  />
                </div>
              </form>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_auto] lg:shrink-0">
                <FileStatusFilter value={status} />
                <UploadFileDialog plan={profile?.plan} />
              </div>
            </div>
          </div>
        </section>

        <FileTable search={query} status={status} plan={profile?.plan} />
      </div>
    </div>
  );
}