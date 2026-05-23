"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hasMediaRecorder } from "@/lib/speech";
import type { SessionAnswer } from "@/types/session";

interface RecorderProps {
  questionId: string;
  targetSeconds: number;
  whisperAvailable: boolean;
  onAnswer: (answer: SessionAnswer) => void;
  onSkip?: () => void;
}

type RecState = "idle" | "recording" | "transcribing" | "done" | "error" | "text-only";

export default function Recorder({
  questionId,
  targetSeconds,
  whisperAvailable,
  onAnswer,
  onSkip,
}: RecorderProps) {
  const [state, setState] = useState<RecState>(() =>
    whisperAvailable && hasMediaRecorder() ? "idle" : "text-only",
  );
  const [elapsedMs, setElapsedMs] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset on questionId change
  useEffect(() => {
    setState(whisperAvailable && hasMediaRecorder() ? "idle" : "text-only");
    setElapsedMs(0);
    setTranscript("");
    setError(null);
  }, [questionId, whisperAvailable]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        await transcribeBlob();
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
      const message =
        err instanceof Error ? err.message : "Mic permission denied";
      setError(message);
      setState("error");
    }
  }, []);

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setState("transcribing");
  };

  const transcribeBlob = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
    const durationMs = performance.now() - startedAtRef.current;
    try {
      const form = new FormData();
      form.append("audio", audioBlob, "answer.webm");
      form.append("durationMs", String(durationMs));
      form.append("targetWindowSec", String(targetSeconds));

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      if (res.status === 503) {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || "Whisper not configured; type your answer instead.");
        setState("text-only");
        return;
      }
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Transcription failed" }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        transcript: string;
        voice: {
          wordsPerMinute?: number;
          fillerCount?: number;
          inTargetWindow?: boolean;
          pacingFeedback?: string;
        };
      };
      setTranscript(data.transcript);
      setState("done");
      onAnswer({
        questionId,
        transcript: data.transcript,
        durationMs,
        wordsPerMinute: data.voice.wordsPerMinute,
        fillerCount: data.voice.fillerCount,
        inTargetWindow: data.voice.inTargetWindow,
        pacingFeedback: data.voice.pacingFeedback,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transcription failed";
      setError(message);
      setState("error");
    }
  };

  const submitText = (text: string) => {
    if (!text.trim()) return;
    setTranscript(text);
    setState("done");
    onAnswer({ questionId, transcript: text.trim() });
  };

  const seconds = elapsedMs / 1000;
  const overWindow = seconds > targetSeconds * 1.25;
  const inWindow =
    seconds >= targetSeconds * 0.75 && seconds <= targetSeconds * 1.25;

  return (
    <div className="tint-paper rounded-2xl p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Your answer</span>
        <span className="text-xs text-[color:var(--color-ink-3)] nums-tabular">
          Target: {targetSeconds}s
        </span>
      </div>

      {state === "idle" && (
        <div className="space-y-3">
          <p className="text-sm text-[color:var(--color-ink-2)]">
            Speak your answer aloud. Mic stops the moment you click stop; the
            audio is transcribed by Whisper, then graded.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-sm font-medium ease-standard transition-colors hover:bg-[color:var(--color-accent-2)]"
            >
              <span
                aria-hidden
                className="inline-block size-2 rounded-full bg-[color:var(--color-danger)]"
              />
              Start recording
            </button>
            <button
              type="button"
              onClick={() => setState("text-only")}
              className="inline-flex items-center px-4 py-2 rounded-full hairline text-sm text-[color:var(--color-ink-2)] hover:bg-[color:var(--color-paper-3)] ease-standard transition-colors"
            >
              Type instead
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink-2)] ease-standard transition-colors"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}

      {state === "recording" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="size-2.5 rounded-full bg-[color:var(--color-danger)] animate-pulse" />
            <span
              className={`font-display text-3xl nums-tabular ${
                overWindow
                  ? "text-[color:var(--color-danger)]"
                  : inWindow
                    ? "text-[color:var(--color-positive)]"
                    : "text-[color:var(--color-ink)]"
              }`}
            >
              {seconds.toFixed(1)}s
            </span>
            <span className="text-xs text-[color:var(--color-ink-3)] ml-auto">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-sm font-medium ease-standard transition-colors hover:bg-[color:var(--color-accent-2)]"
          >
            Stop + transcribe
          </button>
        </div>
      )}

      {state === "transcribing" && (
        <div className="flex items-center gap-2 text-sm text-[color:var(--color-ink-2)]">
          <span className="size-3 border-2 border-[color:var(--color-ink-3)] border-t-[color:var(--color-ink)] rounded-full animate-spin" />
          Transcribing…
        </div>
      )}

      {state === "text-only" && (
        <TextAnswer onSubmit={submitText} disabled={false} />
      )}

      {state === "done" && transcript && (
        <div className="space-y-2">
          <p className="text-xs eyebrow">Transcript</p>
          <p className="text-sm text-[color:var(--color-ink-2)] leading-relaxed">
            {transcript}
          </p>
        </div>
      )}

      {state === "error" && error && (
        <div className="space-y-2">
          <p className="text-sm text-[color:var(--color-danger)]">{error}</p>
          <button
            type="button"
            onClick={() => setState("text-only")}
            className="text-xs text-[color:var(--color-accent)] underline-offset-4 hover:underline"
          >
            Type the answer instead
          </button>
        </div>
      )}
    </div>
  );
}

function TextAnswer({
  onSubmit,
  disabled,
}: {
  onSubmit: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your answer here…"
        rows={6}
        disabled={disabled}
        className="w-full rounded-xl hairline p-3 bg-[color:var(--color-paper)] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-4)] focus:outline-none focus:border-[color:var(--color-accent)]"
      />
      <button
        type="button"
        onClick={() => onSubmit(value)}
        disabled={value.trim().length < 10}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-sm font-medium ease-standard transition-colors hover:bg-[color:var(--color-accent-2)] disabled:opacity-40"
      >
        Submit answer
      </button>
    </div>
  );
}
