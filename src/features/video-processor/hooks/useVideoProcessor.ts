"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { VideoFile, ProcessingStatusResponse } from "@/types/video";
import { VideoStatus } from "@/types/video";
import { uploadVideo, fetchProcessingStatus } from "@/services/videoService";

// ─────────────────────────────────────────────
// Shape of the hook's public API
// ─────────────────────────────────────────────

export interface UseVideoProcessorReturn {
  /** The latest known VideoFile entity (null until a file is selected). */
  videoStatus: VideoFile | null;

  /** Upload progress 0–100. Meaningful only when status === UPLOADING. */
  uploadProgress: number;

  /** Processing progress 0–100. Meaningful only when status === PROCESSING. */
  processingProgress: number;

  /** Non-null when an error has occurred. */
  error: string | null;

  /**
   * Kicks off the upload + polling pipeline for the given file.
   * Safe to call again after COMPLETED / ERROR to start fresh.
   */
  startUpload: (file: File) => void;

  /** Resets all state back to the initial idle state. */
  reset: () => void;
}

// ─────────────────────────────────────────────
// Initial state helper
// ─────────────────────────────────────────────

function makeOptimisticVideo(file: File): VideoFile {
  return {
    id: "",
    name: file.name,
    size: file.size,
    duration: 0,
    status: VideoStatus.UPLOADING,
  };
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useVideoProcessor(): UseVideoProcessorReturn {
  const [videoStatus, setVideoStatus] = useState<VideoFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * AbortController ref — shared between upload and polling phases.
   * Aborted on component unmount OR when `reset` is called.
   */
  const abortRef = useRef<AbortController | null>(null);

  // ── Cleanup on unmount ──────────────────────

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ── reset ───────────────────────────────────

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setVideoStatus(null);
    setUploadProgress(0);
    setProcessingProgress(0);
    setError(null);
  }, []);

  // ── startUpload ─────────────────────────────

  const startUpload = useCallback((file: File) => {
    // Cancel any in-flight operation before starting anew
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Optimistic UI — show the file card immediately in UPLOADING state
    setVideoStatus(makeOptimisticVideo(file));
    setUploadProgress(0);
    setProcessingProgress(0);
    setError(null);

    // ── Phase 1: Upload ────────────────────────

    uploadVideo(file, {
      signal: controller.signal,
      onUploadProgress: (pct) => setUploadProgress(pct),
    })
      .then((serverVideo) => {
        if (controller.signal.aborted) return;

        // Merge server data (id, duration, etc.) and move to PROCESSING
        setVideoStatus({ ...serverVideo, status: VideoStatus.PROCESSING });
        setUploadProgress(100);

        // ── Phase 2: Poll for processing status ─

        return fetchProcessingStatus(serverVideo.id, {
          signal: controller.signal,
          onStatusChange: (response: ProcessingStatusResponse) => {
            if (controller.signal.aborted) return;

            setProcessingProgress(response.progress);

            setVideoStatus((prev) =>
              prev ? { ...prev, status: response.status } : prev
            );
          },
        });
      })
      .then((finalResponse) => {
        if (!finalResponse || controller.signal.aborted) return;

        // Commit terminal state
        setVideoStatus((prev) =>
          prev ? { ...prev, status: finalResponse.status } : prev
        );
        setProcessingProgress(100);

        if (finalResponse.status === VideoStatus.ERROR) {
          setError(finalResponse.errorMessage ?? "حدث خطأ أثناء المعالجة");
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return; // intentional cancel — silently ignore

        const message =
          err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        setError(message);
        setVideoStatus((prev) =>
          prev ? { ...prev, status: VideoStatus.ERROR } : prev
        );
      });
  }, []);

  return {
    videoStatus,
    uploadProgress,
    processingProgress,
    error,
    startUpload,
    reset,
  };
}
