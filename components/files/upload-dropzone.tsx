"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  compact?: boolean;
}

function isAcceptedFile(file: File, accept: string) {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const acceptParts = accept
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return acceptParts.some((part) => {
    if (part.startsWith(".")) {
      return fileName.endsWith(part);
    }

    if (part.endsWith("/*")) {
      const baseType = part.replace("/*", "");
      return fileType.startsWith(baseType);
    }

    return fileType === part;
  });
}

function validateFiles(files: File[], accept: string, maxSizeMb: number) {
  const maxBytes = maxSizeMb * 1024 * 1024;

  for (const file of files) {
    if (file.size > maxBytes) {
      return {
        valid: false,
        error: `File too large (max ${maxSizeMb}MB)`,
      };
    }

    if (!isAcceptedFile(file, accept)) {
      return {
        valid: false,
        error: "Unsupported file type",
      };
    }
  }

  return {
    valid: true,
    error: null,
  };
}

export function UploadDropzone({
  onFileSelect,
  accept = "application/pdf,.docx,.txt",
  maxSizeMb = 15,
  disabled = false,
  compact = false,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | File[]) {
    if (disabled) return;

    const selectedFiles = Array.from(files);

    if (selectedFiles.length === 0) return;

    const validation = validateFiles(selectedFiles, accept, maxSizeMb);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    onFileSelect(selectedFiles);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    handleFiles(event.target.files);

    event.target.value = "";
  }

  function handleClick() {
    if (disabled) return;

    inputRef.current?.click();
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (disabled) return;

    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (disabled) return;

    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (disabled) return;

    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={compact ? "" : "max-md:p-[20px]"}
        style={{
          position: "relative",
          borderRadius: "12px",
          transition: "border-color 160ms ease, background 160ms ease",
          cursor: disabled ? "not-allowed" : "pointer",
          background: isDragging
            ? "rgba(231,197,154,0.04)"
            : "rgba(255,255,255,0.02)",
          border: `1.5px dashed ${
            isDragging
              ? "rgba(231,197,154,0.50)"
              : "rgba(255,255,255,0.12)"
          }`,
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? "none" : "auto",
          padding: compact ? "12px 20px" : "32px",
          textAlign: compact ? "left" : "center",
          outline: "none",
        }}
        onFocus={(event) => {
          event.currentTarget.style.borderColor = "rgba(231,197,154,0.50)";
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor = isDragging
            ? "rgba(231,197,154,0.50)"
            : "rgba(255,255,255,0.12)";
        }}
      >
        <CornerBracket position="top-left" active={isDragging} />
        <CornerBracket position="top-right" active={isDragging} />
        <CornerBracket position="bottom-left" active={isDragging} />
        <CornerBracket position="bottom-right" active={isDragging} />

        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple
          onChange={handleInputChange}
        />

        {compact ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <UploadCloud
              size={18}
              style={{
                color: isDragging ? "#e7c59a" : "#6a6b6c",
                transition: "color 160ms ease",
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontSize: "13px",
                color: "#6a6b6c",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Drop files here or click to upload
            </span>

            <span
              style={{
                fontSize: "11px",
                fontFamily:
                  "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                color: "#454647",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Max {maxSizeMb}MB
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <UploadCloud
              size={32}
              className="max-md:!h-[24px] max-md:!w-[24px]"
              style={{
                color: isDragging ? "#e7c59a" : "#454647",
                transition: "color 160ms ease",
                marginBottom: "12px",
              }}
            />

            <div
              style={{
                fontFamily:
                  "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                fontSize: "13px",
                fontWeight: 500,
                textTransform: "uppercase",
                color: "#6a6b6c",
                letterSpacing: "0.04em",
              }}
            >
              DROP RESUME PDF HERE
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#454647",
                marginTop: "4px",
              }}
            >
              or click to upload
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#454647",
                marginTop: "6px",
                fontFamily:
                  "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
              }}
            >
              PDF, DOCX, TXT • Max {maxSizeMb}MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#ff6363",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function CornerBracket({
  position,
  active,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  active: boolean;
}) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: "12px",
    height: "12px",
    borderColor: "#e7c59a",
    opacity: active ? 1 : 0.4,
    transition: "opacity 160ms ease",
    pointerEvents: "none",
  };

  if (position === "top-left") {
    Object.assign(style, {
      top: 0,
      left: 0,
      borderTop: "2px solid #e7c59a",
      borderLeft: "2px solid #e7c59a",
      borderTopLeftRadius: "12px",
    });
  }

  if (position === "top-right") {
    Object.assign(style, {
      top: 0,
      right: 0,
      borderTop: "2px solid #e7c59a",
      borderRight: "2px solid #e7c59a",
      borderTopRightRadius: "12px",
    });
  }

  if (position === "bottom-left") {
    Object.assign(style, {
      bottom: 0,
      left: 0,
      borderBottom: "2px solid #e7c59a",
      borderLeft: "2px solid #e7c59a",
      borderBottomLeftRadius: "12px",
    });
  }

  if (position === "bottom-right") {
    Object.assign(style, {
      bottom: 0,
      right: 0,
      borderBottom: "2px solid #e7c59a",
      borderRight: "2px solid #e7c59a",
      borderBottomRightRadius: "12px",
    });
  }

  return <span aria-hidden="true" style={style} />;
}

export default UploadDropzone;