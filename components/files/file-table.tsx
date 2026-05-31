import {
  FileMobileCard,
  FileTableRow,
  type FileRowData,
} from "./file-row";
import { createClient } from "@/lib/supabase/server";

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
    updated: getString(row, ["created_at"], ""),
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
      <section
        className="rounded-[14px] border p-5"
        style={{
          background: "rgba(255,99,99,0.08)",
          borderColor: "rgba(255,99,99,0.25)",
        }}
      >
        <p
          className="font-jetbrains text-[11px] uppercase tracking-[0.14em]"
          style={{ color: "#ff8c8c" }}
        >
          FILE_QUERY_FAILED
        </p>

        <p className="mt-2 text-[13px]" style={{ color: "#f3f3f3" }}>
          {error.message}
        </p>
      </section>
    );
  }

  const files = (data || [])
    .map((row) => normalizeDbFile(row))
    .filter((file) => {
      const matchesSearch = search
        ? file.fileName.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesStatus =
        status === "all"
          ? true
          : file.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });

  return (
    <section
      className="overflow-hidden rounded-[18px] border"
      style={{
        background: "#111214",
        borderColor: "rgba(255,255,255,0.1)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 50px rgba(0,0,0,0.24)",
      }}
    >
      {/* Table Header */}
      <div
        className="flex flex-col gap-2 border-b px-5 py-5 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p
          className="font-jetbrains text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "#9c9c9d" }}
        >
          SOURCE_FILES
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2
            className="text-[20px] font-semibold tracking-[-0.03em]"
            style={{ color: "#f3f3f3" }}
          >
            File Table
          </h2>

          <p
            className="font-jetbrains text-[11px] uppercase tracking-[0.12em]"
            style={{ color: "#6a6b6c" }}
          >
            {files.length} file{files.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
          <p
            className="font-jetbrains text-[11px] uppercase tracking-[0.16em]"
            style={{ color: "#e7c59a" }}
          >
            NO_FILES_FOUND
          </p>

          <h3
            className="mt-3 text-[18px] font-semibold tracking-[-0.02em]"
            style={{ color: "#f3f3f3" }}
          >
            No source files yet
          </h3>

          <p
            className="mt-2 max-w-md text-[13px] leading-6"
            style={{ color: "#9c9c9d" }}
          >
            Upload your first resume file using the Upload File button. Parsed
            files will appear here with mode, status, pages, and actions.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] table-fixed border-collapse">
              <thead style={{ background: "#0b0c0d" }}>
                <tr
                  className="border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <th className="w-[30%] px-4 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-[#6a6b6c]">
                    File name
                  </th>
                  <th className="w-[10%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-[#6a6b6c]">
                    Size
                  </th>
                  <th className="w-[10%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-[#6a6b6c]">
                    Type
                  </th>
                  <th className="w-[12%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-[#6a6b6c]">
                    Mode
                  </th>
                  <th className="w-[13%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-[#6a6b6c]">
                    Status
                  </th>
                  <th className="w-[8%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-[#6a6b6c]">
                    Pages
                  </th>
                  <th className="w-[10%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-[#6a6b6c]">
                    Created
                  </th>
                  <th className="w-[7%] px-4 py-3 text-right font-jetbrains text-[10px] uppercase tracking-[0.14em] text-[#6a6b6c]">
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

          {/* Mobile Cards */}
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