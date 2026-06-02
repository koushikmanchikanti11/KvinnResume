"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ComponentType, ReactNode } from "react";
import {
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { ParseStatus } from "./parser-status-badge";

interface FileActionMenuProps {
  fileId: string;
  fileName: string;
  status: ParseStatus;
  onView?: () => void;
  onReParse?: () => void;
  onUseInResume?: () => void;
  onDownloadJson?: () => void;
  onDelete?: () => void;
}

type MenuAction = {
  label: string;
  icon: ComponentType<{ size?: number }>;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
};

export default function FileActionMenu({
  fileId,
  fileName,
  status,
  onView,
  onReParse,
  onUseInResume,
  onDownloadJson,
  onDelete,
}: FileActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const menuWidth = 196;
      const gap = 4;

      let left = rect.right - menuWidth;
      let top = rect.bottom + gap;

      if (left < 8) left = 8;

      const maxLeft = window.innerWidth - menuWidth - 8;
      if (left > maxLeft) left = maxLeft;

      const menuHeight = 220;
      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - gap;
      }

      setMenuPosition({ top, left });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleItemClick(callback?: () => void, disabled?: boolean) {
    if (disabled) return;

    callback?.();
    setOpen(false);
  }

  const actions: MenuAction[] = [
    {
      label: "Open / View content",
      icon: Eye,
      onClick: onView,
      disabled: status === "running" || status === "pending" || !onView,
    },
    {
      label: "Re-parse",
      icon: RefreshCw,
      onClick: onReParse,
      disabled: status === "running" || !onReParse,
    },
    {
      label: "Use in resume",
      icon: FileText,
      onClick: onUseInResume,
      disabled: status !== "completed" || !onUseInResume,
    },
    {
      label: "Download JSON",
      icon: Download,
      onClick: onDownloadJson,
      disabled: status !== "completed" || !onDownloadJson,
    },
  ];

  const menu = (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`Actions for ${fileName}`}
      style={{
        position: "fixed",
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        width: "196px",
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "10px",
        padding: "6px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
        zIndex: 9999,
        animation: "file-action-menu-fade 160ms ease",
      }}
    >
      <style>
        {`
          @keyframes file-action-menu-fade {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            [role="menu"] {
              animation-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      {actions.map((action) => (
        <MenuItem
          key={action.label}
          icon={action.icon}
          disabled={action.disabled}
          onClick={() => handleItemClick(action.onClick, action.disabled)}
        >
          {action.label}
        </MenuItem>
      ))}

      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.06)",
          margin: "5px 0",
        }}
      />

      <MenuItem
        icon={Trash2}
        danger
        disabled={!onDelete}
        onClick={() => handleItemClick(onDelete, !onDelete)}
      >
        Delete
      </MenuItem>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Open actions for ${fileName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        data-file-id={fileId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center justify-center"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          background: open ? "rgba(255,255,255,0.06)" : "transparent",
          border: "none",
          cursor: "pointer",
          color: open ? "#9c9c9d" : "#454647",
          transition: "background 160ms ease, color 160ms ease",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.background = "rgba(255,255,255,0.06)";
          event.currentTarget.style.color = "#9c9c9d";
        }}
        onMouseLeave={(event) => {
          if (open) return;
          event.currentTarget.style.background = "transparent";
          event.currentTarget.style.color = "#454647";
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      {mounted && open ? createPortal(menu, document.body) : null}
    </>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: ComponentType<{ size?: number }>;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        height: "34px",
        padding: "0 10px",
        display: "flex",
        alignItems: "center",
        gap: "9px",
        border: "none",
        borderRadius: "7px",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        pointerEvents: disabled ? "none" : "auto",
        fontSize: "13px",
        fontWeight: 400,
        color: danger ? "#ff8c8c" : "#9c9c9d",
        transition: "background 120ms ease, color 120ms ease",
        textAlign: "left",
      }}
      onMouseEnter={(event) => {
        if (disabled) return;

        event.currentTarget.style.background = danger
          ? "rgba(255,99,99,0.08)"
          : "rgba(255,255,255,0.05)";
        event.currentTarget.style.color = danger ? "#ff8c8c" : "#f3f3f3";
      }}
      onMouseLeave={(event) => {
        if (disabled) return;

        event.currentTarget.style.background = "transparent";
        event.currentTarget.style.color = danger ? "#ff8c8c" : "#9c9c9d";
      }}
    >
      <Icon size={14} />
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}