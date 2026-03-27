"use client";

import React, { useCallback, useRef } from "react";
import {
  UploadCloud,
  Film,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { VideoStatus, type VideoFile } from "@/types/video";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

export interface UploaderZoneProps {
  /** Currently tracked video file (null = no file selected yet) */
  video: VideoFile | null;

  /** Upload progress percentage (0–100). Shown during UPLOADING status. */
  uploadProgress: number;

  /** Processing progress percentage (0–100). Shown during PROCESSING status. */
  processingProgress: number;

  /** Called when the user drops / selects a new file */
  onFileSelect: (file: File) => void;

  /** Called when the user wants to remove / reset the current video */
  onReset: () => void;

  /** Whether the drop zone should accept new files right now */
  disabled?: boolean;
}

// ─────────────────────────────────────────────
// Helper — status metadata
// ─────────────────────────────────────────────

interface StatusMeta {
  label: string;
  color: string;         // Tailwind text color
  barColor: string;      // Tailwind bg color for the progress bar fill
  progress: number;
  animate: boolean;
}

function resolveStatusMeta(
  status: VideoStatus,
  uploadProgress: number,
  processingProgress: number
): StatusMeta {
  switch (status) {
    case VideoStatus.UPLOADING:
      return {
        label: `جارٍ الرفع… ${uploadProgress}%`,
        color: "text-blue-400",
        barColor: "bg-blue-500",
        progress: uploadProgress,
        animate: true,
      };
    case VideoStatus.PROCESSING:
      return {
        label: `جارٍ المعالجة… ${processingProgress}%`,
        color: "text-violet-400",
        barColor: "bg-violet-500",
        progress: processingProgress,
        animate: true,
      };
    case VideoStatus.COMPLETED:
      return {
        label: "اكتملت المعالجة بنجاح",
        color: "text-emerald-400",
        barColor: "bg-emerald-500",
        progress: 100,
        animate: false,
      };
    case VideoStatus.ERROR:
      return {
        label: "حدث خطأ أثناء المعالجة",
        color: "text-red-400",
        barColor: "bg-red-500",
        progress: 100,
        animate: false,
      };
    default:
      return {
        label: "جاهز",
        color: "text-slate-400",
        barColor: "bg-slate-600",
        progress: 0,
        animate: false,
      };
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface ProgressBarProps {
  progress: number;
  barColor: string;
  animate: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, barColor, animate }) => (
  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={[
        "h-full rounded-full transition-[width] duration-700 ease-out",
        barColor,
        animate ? "relative after:absolute after:inset-0 after:bg-white/20 after:animate-[shimmer_1.5s_infinite]" : "",
      ].join(" ")}
      style={{ width: `${progress}%` }}
    />
  </div>
);

interface StatusIconProps {
  status: VideoStatus;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  const cls = "w-5 h-5 shrink-0";
  switch (status) {
    case VideoStatus.UPLOADING:
    case VideoStatus.PROCESSING:
      return <Loader2 className={`${cls} text-blue-400 animate-spin`} />;
    case VideoStatus.COMPLETED:
      return <CheckCircle2 className={`${cls} text-emerald-400`} />;
    case VideoStatus.ERROR:
      return <AlertCircle className={`${cls} text-red-400`} />;
    default:
      return <Film className={`${cls} text-slate-400`} />;
  }
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export const UploaderZone: React.FC<UploaderZoneProps> = ({
  video,
  uploadProgress,
  processingProgress,
  onFileSelect,
  onReset,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  // ── Event handlers ──────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) {
        onFileSelect(file);
      }
    },
    [disabled, onFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [onFileSelect]
  );

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  // ── Derived state ───────────────────────────

  const statusMeta = video
    ? resolveStatusMeta(video.status, uploadProgress, processingProgress)
    : null;

  const isActive =
    video?.status === VideoStatus.UPLOADING ||
    video?.status === VideoStatus.PROCESSING;

  // ── Render ──────────────────────────────────

  return (
    <div className="w-full max-w-xl mx-auto font-sans">
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="منطقة رفع الفيديو"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        onKeyDown={(e) => e.key === "Enter" && openFilePicker()}
        className={[
          "group relative flex flex-col items-center justify-center gap-4",
          "rounded-2xl border-2 border-dashed p-10 cursor-pointer",
          "transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
          // Background
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          // Border colour
          isDragOver
            ? "border-violet-400 bg-violet-900/20 scale-[1.01]"
            : video
            ? "border-slate-600"
            : "border-slate-700 hover:border-violet-500 hover:bg-slate-800/60",
          // Disabled state
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        {/* Icon */}
        <div
          className={[
            "flex items-center justify-center w-16 h-16 rounded-full",
            "bg-white/5 border border-white/10",
            "transition-transform duration-300",
            isDragOver ? "scale-110" : "group-hover:scale-105",
          ].join(" ")}
        >
          <UploadCloud
            className={[
              "w-7 h-7 transition-colors duration-300",
              isDragOver ? "text-violet-400" : "text-slate-400 group-hover:text-violet-400",
            ].join(" ")}
          />
        </div>

        {/* Copy */}
        {!video ? (
          <div className="text-center space-y-1 select-none">
            <p className="text-sm font-medium text-slate-200">
              اسحب وأفلت الفيديو هنا
            </p>
            <p className="text-xs text-slate-500">
              أو{" "}
              <span className="text-violet-400 underline underline-offset-2">
                اختر ملفاً
              </span>{" "}
              من جهازك
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              MP4 · MOV · AVI · MKV — حتى 2 GB
            </p>
          </div>
        ) : null}

        {/* Drag-over overlay text */}
        {isDragOver && (
          <p className="absolute text-sm font-semibold text-violet-300 animate-pulse pointer-events-none">
            أفلت الملف الآن…
          </p>
        )}
      </div>

      {/* File Card */}
      {video && statusMeta && (
        <div className="mt-4 rounded-xl bg-slate-800/70 border border-white/10 backdrop-blur-sm p-4 space-y-3 shadow-xl shadow-black/30">
          {/* File info row */}
          <div className="flex items-center gap-3">
            <StatusIcon status={video.status} />

            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-slate-100 truncate"
                title={video.name}
              >
                {video.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatBytes(video.size)}{" "}
                {video.duration > 0 && (
                  <>
                    · {Math.floor(video.duration / 60)}:
                    {String(Math.round(video.duration % 60)).padStart(2, "0")}
                  </>
                )}
              </p>
            </div>

            {/* Reset button — only when not actively processing */}
            {!isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                aria-label="إزالة الفيديو"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <ProgressBar
            progress={statusMeta.progress}
            barColor={statusMeta.barColor}
            animate={statusMeta.animate}
          />

          {/* Status label */}
          <p className={`text-xs font-medium ${statusMeta.color}`}>
            {statusMeta.label}
          </p>
        </div>
      )}

      {/* Shimmer keyframe — injected once via a style tag */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default UploaderZone;
