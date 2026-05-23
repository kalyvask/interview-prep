"use client";

import { useEffect, useRef, useState } from "react";
import type { VoiceCapture } from "@/types";

interface VoiceRecorderProps {
  /** Window in seconds (e.g. 90 for recruiter intro) */
  targetWindowSec: number;
  disabled?: boolean;
  /** Called once transcription + voice scoring completes */
  onTranscript: (transcript: string, voice: VoiceCapture) => void;
  /** Called when user wants to switch back to typed answer */
  onCancel?: () => void;
}

type RecorderState = "idle" | "recording" | "uploading" | "done" | "error";

export default function VoiceRecorder({
  targetWindowSec,
  disabled,
  onTranscript,
  onCancel,
}: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    setError(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("Your browser does not expose MediaRecorder; voice mode is unavailable here.");
      setState("error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        uploadBlob();
      };
      mediaRecorderRef.current = recorder;
      startedAtRef.current = performance.now();
      recorder.start();
      setState("recording");
      setElapsedMs(0);
      timerRef.current = setInterval(() => {
        setElapsedMs(performance.now() - startedAtRef.current);
      }, 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mic permission denied";
      setError(message);
      setState("error");
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setState("uploading");
  }

  async function uploadBlob() {
    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
    const durationMs = performance.now() - startedAtRef.current;
    try {
      const form = new FormData();
      form.append("audio", audioBlob, "answer.webm");
      form.append("durationMs", String(durationMs));
      form.append("targetWindowSec", String(targetWindowSec));

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Transcription failed" }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { transcript: string; voice: VoiceCapture };
      onTranscript(data.transcript, data.voice);
      setState("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transcription failed";
      setError(message);
      setState("error");
    }
  }

  const seconds = elapsedMs / 1000;
  const overWindow = seconds > targetWindowSec * 1.25;
  const inWindow = seconds >= targetWindowSec * 0.75 && seconds <= targetWindowSec * 1.25;

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900">Voice answer</span>
        <span className="text-xs text-slate-500">Target: {targetWindowSec}s</span>
      </div>

      {state === "idle" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Speak your answer aloud. Recording uses your mic; transcription runs server-side via
            Whisper. Pacing, fillers, and the {targetWindowSec}-second window are scored on the
            transcript.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={startRecording}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg"
            >
              Start recording
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:border-slate-300"
              >
                Switch to typing
              </button>
            )}
          </div>
        </div>
      )}

      {state === "recording" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span
              className={`text-2xl font-mono ${
                overWindow ? "text-red-600" : inWindow ? "text-emerald-600" : "text-slate-700"
              }`}
            >
              {seconds.toFixed(1)}s
            </span>
            <span className="text-xs text-slate-400 ml-auto">
              {overWindow
                ? "Past target — interviewer would interrupt"
                : inWindow
                  ? "Within target window"
                  : "Building up"}
            </span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg"
          >
            Stop + transcribe
          </button>
        </div>
      )}

      {state === "uploading" && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          Transcribing audio...
        </div>
      )}

      {state === "done" && (
        <p className="text-sm text-emerald-700">Transcription complete. Voice scoring attached.</p>
      )}

      {state === "error" && error && (
        <div className="space-y-2">
          <p className="text-sm text-red-700">{error}</p>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-indigo-700 underline"
            >
              Switch to typing
            </button>
          )}
        </div>
      )}
    </div>
  );
}
