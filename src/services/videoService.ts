import axios, { AxiosProgressEvent } from "axios";
import type {
  VideoFile,
  ProcessingStatusResponse,
} from "@/types/video";
import { VideoStatus } from "@/types/video";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const POLLING_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 60; // 3 min timeout at 3-s intervals

// ─────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface UploadVideoOptions {
  /** Called periodically with upload progress (0–100) */
  onUploadProgress?: (percentage: number) => void;
  /** AbortController signal to cancel the request */
  signal?: AbortSignal;
}

export interface PollStatusOptions {
  /** Called on every successful poll tick */
  onStatusChange?: (response: ProcessingStatusResponse) => void;
  /** AbortController signal to cancel polling */
  signal?: AbortSignal;
}

// ─────────────────────────────────────────────
// uploadVideo
// ─────────────────────────────────────────────

/**
 * Uploads a video file to the Laravel backend for processing.
 *
 * @param file   - The raw File object selected / dropped by the user.
 * @param options - Optional upload-progress callback and abort signal.
 * @returns       The created VideoFile entity returned by the API.
 */
export async function uploadVideo(
  file: File,
  options: UploadVideoOptions = {}
): Promise<VideoFile> {
  const { onUploadProgress, signal } = options;

  const formData = new FormData();
  formData.append("video", file);

  const { data } = await apiClient.post<VideoFile>("/videos/upload", formData, {
    signal,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onUploadProgress && event.total) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        onUploadProgress(percentage);
      }
    },
  });

  return data;
}

// ─────────────────────────────────────────────
// fetchProcessingStatus
// ─────────────────────────────────────────────

/**
 * Polls the backend for the processing status of a video until it
 * reaches a terminal state (COMPLETED | ERROR) or the caller aborts.
 *
 * Uses exponential-safe fixed-interval polling with a maximum attempt
 * guard to prevent infinite loops.
 *
 * @param videoId - The id of the VideoFile being processed.
 * @param options  - Optional status-change callback and abort signal.
 * @returns         The final ProcessingStatusResponse when done.
 */
export async function fetchProcessingStatus(
  videoId: string,
  options: PollStatusOptions = {}
): Promise<ProcessingStatusResponse> {
  const { onStatusChange, signal } = options;

  const terminalStates = new Set<VideoStatus>([
    VideoStatus.COMPLETED,
    VideoStatus.ERROR,
  ]);

  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      // Respect AbortController cancellation
      if (signal?.aborted) {
        reject(new DOMException("Polling aborted by the caller.", "AbortError"));
        return;
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        reject(new Error(`Polling timed out after ${MAX_POLL_ATTEMPTS} attempts.`));
        return;
      }

      attempts++;

      try {
        const { data } = await apiClient.get<ProcessingStatusResponse>(
          `/videos/${videoId}/status`,
          { signal }
        );

        onStatusChange?.(data);

        if (terminalStates.has(data.status)) {
          resolve(data);
          return;
        }

        // Schedule next tick
        setTimeout(poll, POLLING_INTERVAL_MS);
      } catch (error) {
        if (axios.isCancel(error)) {
          reject(new DOMException("Polling aborted by the caller.", "AbortError"));
        } else {
          reject(error);
        }
      }
    };

    poll();
  });
}
