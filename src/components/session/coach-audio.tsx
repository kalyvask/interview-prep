"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speakBrowser, cancelBrowserSpeech, playAudioStream } from "@/lib/speech";

interface CoachAudioProps {
  text: string;
  questionId: string;
  elevenlabsAvailable: boolean;
  voiceId: string;
  autoPlay?: boolean;
}

type AudioState = "idle" | "loading" | "playing" | "done" | "error";

export default function CoachAudio({
  text,
  questionId,
  elevenlabsAvailable,
  voiceId,
  autoPlay = true,
}: CoachAudioProps) {
  const [state, setState] = useState<AudioState>("idle");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoPlayedRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    cancelBrowserSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const play = useCallback(async () => {
    setError(null);
    setState("loading");
    try {
      if (elevenlabsAvailable) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId }),
        });
        if (!res.ok) throw new Error(`TTS error: ${res.status}`);
        const audio = await playAudioStream(res);
        audioRef.current = audio;
        setState("playing");
        audio.addEventListener("ended", () => setState("done"));
      } else {
        setState("playing");
        await speakBrowser(text);
        setState("done");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Audio failed";
      setError(message);
      setState("error");
    }
  }, [text, voiceId, elevenlabsAvailable]);

  useEffect(() => {
    if (autoPlay && hasAutoPlayedRef.current !== questionId) {
      hasAutoPlayedRef.current = questionId;
      play();
    }
    return () => stop();
  }, [questionId, autoPlay, play, stop]);

  return (
    <div className="flex items-center gap-3 text-sm text-[color:var(--color-ink-3)]">
      <button
        type="button"
        onClick={state === "playing" ? stop : play}
        disabled={state === "loading"}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full hairline hover:bg-[color:var(--color-paper-2)] ease-standard transition-colors disabled:opacity-50"
      >
        {state === "loading" && <span>Loading audio…</span>}
        {state === "playing" && <span>Stop</span>}
        {(state === "idle" || state === "done" || state === "error") && (
          <span>{state === "done" ? "Replay" : "Play question"}</span>
        )}
      </button>
      {elevenlabsAvailable ? (
        <span className="eyebrow">ElevenLabs voice</span>
      ) : (
        <span className="eyebrow">Browser voice</span>
      )}
      {error && (
        <span className="text-[color:var(--color-danger)] text-xs">{error}</span>
      )}
    </div>
  );
}
