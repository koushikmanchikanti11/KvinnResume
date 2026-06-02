import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FilesPageClient, {
  type InitialFileRecord,
} from "./files-page-client";

type FilesPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    type?: string;
    sort?: string;
  }>;
};

type ResumeFileRow = {
  id: string;
  original_filename: string;
  mime_type: string | null;
  file_size: number | null;
  parse_status: string;
  parser_mode: string | null;
  pages_count: number | null;
  created_at: string;
};

function normalizeStatus(status: string | null): InitialFileRecord["status"] {
  if (status === "pending") return "pending";
  if (status === "running") return "running";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "cancelled") return "cancelled";

  return "idle";
}

function normalizeParserMode(
  mode: string | null
): InitialFileRecord["parserMode"] {
  if (mode === "nano") return "nano";
  if (mode === "nano_mini") return "nano_mini";
  if (mode === "nano_pro") return "nano_pro";
  if (mode === "auto") return "auto";

  return null;
}

function getFileType(
  filename: string,
  mimeType: string | null
): InitialFileRecord["type"] {
  const lowerName = filename.toLowerCase();
  const lowerMime = mimeType?.toLowerCase() ?? "";

  if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) return "PDF";

  if (
    lowerMime.includes("word") ||
    lowerMime.includes("officedocument.wordprocessingml") ||
    lowerName.endsWith(".docx")
  ) {
    return "DOCX";
  }

  return "TXT";
}

export const metadata = {
  title: "Files — KvinnResume",
};

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const params = await searchParams;

  const initialQuery = params?.q?.trim() ?? "";
  const initialStatus = params?.status ?? "all";
  const initialType = params?.type ?? "all";
  const initialSort = params?.sort ?? "latest";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("resume_files")
    .select(
      "id, original_filename, mime_type, file_size, parse_status, parser_mode, pages_count, created_at"
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch files:", error.message);
  }

  const initialFiles: InitialFileRecord[] = ((data ?? []) as ResumeFileRow[]).map(
    (file) => ({
      id: file.id,
      name: file.original_filename,
      type: getFileType(file.original_filename, file.mime_type),
      status: normalizeStatus(file.parse_status),
      parserMode: normalizeParserMode(file.parser_mode),
      pages: file.pages_count,
      creditsUsed: null,
      updatedAt: file.created_at,
      parseProgress:
        file.parse_status === "running"
          ? 62
          : file.parse_status === "pending"
            ? 0
            : undefined,
    })
  );

  return (
    <FilesPageClient
      initialFiles={initialFiles}
      userPlan={profile?.plan ?? null}
      initialQuery={initialQuery}
      initialStatus={initialStatus}
      initialType={initialType}
      initialSort={initialSort}
    />
  );
}