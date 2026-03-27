"use client";

import { Clapperboard, History, Settings2, Layers } from "lucide-react";
import { UploaderZone } from "@/features/video-processor/components/UploaderZone";
import { useVideoProcessor } from "@/features/video-processor/hooks/useVideoProcessor";
import { VideoStatus } from "@/types/video";

// ─────────────────────────────────────────────
// Sidebar nav items (placeholder)
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: Clapperboard, label: "معالجة الفيديو", active: true },
  { icon: Layers, label: "الأدوات", active: false },
  { icon: History, label: "السجل", active: false },
  { icon: Settings2, label: "الإعدادات", active: false },
];

// ─────────────────────────────────────────────
// Status messages
// ─────────────────────────────────────────────

function resolveStatusMessage(status: VideoStatus, progress: number): string {
  switch (status) {
    case VideoStatus.UPLOADING:
      return `جارٍ رفع الفيلم… ${progress}%`;
    case VideoStatus.PROCESSING:
      return progress < 30
        ? "جارٍ تحليل الفيلم…"
        : progress < 70
        ? "جارٍ تقطيع الفيلم…"
        : "جارٍ إنهاء المعالجة…";
    case VideoStatus.COMPLETED:
      return "✓ اكتملت المعالجة بنجاح";
    case VideoStatus.ERROR:
      return "✗ حدث خطأ — يرجى المحاولة مرة أخرى";
    default:
      return "";
  }
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function VideoToolsPage() {
  const {
    videoStatus,
    uploadProgress,
    processingProgress,
    error,
    startUpload,
    reset,
  } = useVideoProcessor();

  const isActive =
    videoStatus?.status === VideoStatus.UPLOADING ||
    videoStatus?.status === VideoStatus.PROCESSING;

  const statusMessage = videoStatus
    ? resolveStatusMessage(
        videoStatus.status,
        videoStatus.status === VideoStatus.UPLOADING
          ? uploadProgress
          : processingProgress
      )
    : null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      {/* ── Sidebar ──────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col shrink-0 border-l border-white/5 bg-slate-900/70 backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-6 border-b border-white/5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 shadow-lg shadow-violet-900/40">
            <Clapperboard className="w-4 h-4 text-white" />
          </span>
          <span className="text-sm font-bold tracking-wide text-slate-100">
            Video&nbsp;Tools
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              ].join(" ")}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5">
          <p className="text-[11px] text-slate-600 text-center">
            محرر الفيديو الاحترافي
          </p>
        </div>
      </aside>

      {/* ── Main content ─────────────────────── */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h1 className="text-base font-semibold text-slate-100">
              معالجة الفيديو
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ارفع ملفك وانتظر المعالجة التلقائية
            </p>
          </div>

          {/* Status badge */}
          {statusMessage && (
            <span
              className={[
                "text-xs font-medium px-3 py-1.5 rounded-full border",
                isActive
                  ? "text-violet-300 border-violet-500/30 bg-violet-500/10 animate-pulse"
                  : videoStatus?.status === VideoStatus.COMPLETED
                  ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                  : "text-red-300 border-red-500/30 bg-red-500/10",
              ].join(" ")}
            >
              {statusMessage}
            </span>
          )}
        </header>

        {/* Body */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Error banner */}
          {error && (
            <div className="w-full max-w-xl mb-6 rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Uploader */}
          <UploaderZone
            video={videoStatus}
            uploadProgress={uploadProgress}
            processingProgress={processingProgress}
            onFileSelect={startUpload}
            onReset={reset}
            disabled={isActive}
          />

          {/* Processing progress panel (shown while active) */}
          {isActive && (
            <div className="w-full max-w-xl mt-8 rounded-2xl bg-slate-800/60 border border-white/10 backdrop-blur-sm p-6 space-y-4 shadow-2xl shadow-black/40">
              <p className="text-sm font-semibold text-slate-200">
                {statusMessage}
              </p>

              {/* Upload phase */}
              <ProgressStep
                label="رفع الملف"
                progress={uploadProgress}
                done={uploadProgress === 100}
              />

              {/* Process phase */}
              <ProgressStep
                label="معالجة الفيديو"
                progress={processingProgress}
                done={videoStatus?.status === VideoStatus.COMPLETED}
                disabled={uploadProgress < 100}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// ProgressStep sub-component
// ─────────────────────────────────────────────

interface ProgressStepProps {
  label: string;
  progress: number;
  done: boolean;
  disabled?: boolean;
}

function ProgressStep({ label, progress, done, disabled = false }: ProgressStepProps) {
  return (
    <div className={disabled ? "opacity-40" : ""}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-medium text-slate-300">
          {done ? "100%" : `${progress}%`}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          role="progressbar"
          aria-valuenow={done ? 100 : progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className={[
            "h-full rounded-full transition-[width] duration-700 ease-out",
            done ? "bg-emerald-500" : "bg-violet-500",
          ].join(" ")}
          style={{ width: `${done ? 100 : progress}%` }}
        />
      </div>
    </div>
  );
}
