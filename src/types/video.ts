// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

/**
 * Represents the lifecycle state of a video file
 * as it moves through the processing pipeline.
 */
export enum VideoStatus {
  IDLE = "IDLE",
  UPLOADING = "UPLOADING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

// ─────────────────────────────────────────────
// Core Interfaces
// ─────────────────────────────────────────────

/**
 * Represents a video file managed by the processor.
 */
export interface VideoFile {
  /** Unique identifier for the video entry */
  id: string;

  /** Original filename as provided by the user */
  name: string;

  /** File size in bytes */
  size: number;

  /** Video duration in seconds */
  duration: number;

  /** Current lifecycle status of the video */
  status: VideoStatus;
}

/**
 * Represents a single segment (clip) extracted from a video
 * during the processing/splitting phase.
 */
export interface ProcessingTask {
  /** Start time of the segment in seconds */
  startTime: number;

  /** End time of the segment in seconds */
  endTime: number;

  /** Descriptive label for the segment (e.g. "Intro", "Scene 1") */
  label: string;
}

// ─────────────────────────────────────────────
// Derived / Utility Types
// ─────────────────────────────────────────────

/**
 * A video file paired with its extracted processing segments.
 */
export interface VideoWithSegments {
  video: VideoFile;
  segments: ProcessingTask[];
}

/**
 * Shape of the polling response returned by the backend.
 */
export interface ProcessingStatusResponse {
  videoId: string;
  status: VideoStatus;
  progress: number; // 0–100
  segments?: ProcessingTask[];
  errorMessage?: string;
}
