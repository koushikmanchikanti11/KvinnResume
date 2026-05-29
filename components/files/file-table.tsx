import { createClient } from "@/lib/supabase/server";
import {
  FileTableRow,
  FileMobileCard,
  type FileRowData,
} from "./file-row";

type FileTableProps = {
  search?: string;
  status?: string;
  plan?: string | null;
};

function getString(row: Record<string, any>, keys: string[], fallback = "") {
  for (const key of keys) {
    if (row[key]) return String(row[key]);
  }

  return fallback;
}

function getNumber(row: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    if (typeof row[key] === "number") return row[key];
  }

  return null;
}

function normalizeDbFile(row: Record<string, any>): FileRowData {
  return {
    id: String(row.id),
    fileName: getString(
      row,
      ["original_filename", "file_name", "filename", "name"],
      "Untitled file"
    ),
    size: getNumber(row, ["file_size", "size", "size_bytes"]),
    type: getString(row, ["mime_type", "file_type", "type"], "document"),
    mode: getString(row, ["parser_mode", "mode"], "nano"),
    status: getString(row, ["parse_status", "status"], "idle"),
    pages: getNumber(row, ["page_count", "pages", "num_pages"]),
    created: getString(row, ["created_at"], ""),
    storagePath: getString(row, ["storage_path", "file_path", "path"], ""),
  };
}

export async function FileTable({
  search = "",
  status = "all",
  plan,
}: FileTableProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("resume_files")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-kv-accent-red/25 bg-kv-accent-red/10 p-5">
        <p className="font-jetbrains text-[11px] uppercase tracking-[0.14em] text-[#ff8c8c]">
          FILE_QUERY_FAILED
        </p>
        <p className="mt-2 text-[13px] text-kv-text-secondary">
          {error.message}
        </p>
      </div>
    );
  }

  const files = (data || [])
    .map((row) => normalizeDbFile(row))
    .filter((file) => {
      const matchesSearch = search
        ? file.fileName.toLowerCase().includes(search.toLowerCase())
        : true;

      const normalizedStatus = file.status.toLowerCase();
      const matchesStatus =
        status === "all" ? true : normalizedStatus === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-kv-surface-3">
      <div className="flex flex-col gap-1 border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <p className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
          SOURCE_FILES
        </p>
        <h2 className="text-[16px] font-semibold text-kv-text-primary">
          File Table
        </h2>
      </div>

      {files.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-jetbrains text-[11px] uppercase tracking-[0.16em] text-kv-accent-amber">
            NO_FILES_FOUND
          </p>
          <p className="mt-2 text-[13px] text-kv-text-muted">
            Upload your first resume file using the Upload File button.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[920px] table-fixed">
              <thead className="bg-kv-surface-2">
                <tr className="border-b border-white/[0.06]">
                  <th className="w-[27%] px-4 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                    File name
                  </th>
                  <th className="w-[10%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                    Size
                  </th>
                  <th className="w-[10%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                    Type
                  </th>
                  <th className="w-[12%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                    Mode
                  </th>
                  <th className="w-[13%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                    Status
                  </th>
                  <th className="w-[8%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                    Pages
                  </th>
                  <th className="w-[11%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                    Created
                  </th>
                  <th className="w-[9%] px-4 py-3 text-right font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {files.map((file) => (
                  <FileTableRow key={file.id} file={file} plan={plan} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {files.map((file) => (
              <FileMobileCard key={file.id} file={file} plan={plan} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}