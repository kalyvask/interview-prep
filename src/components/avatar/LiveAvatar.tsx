"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  AgentEventsEnum,
  LiveAvatarSession,
  SessionEvent,
  SessionState,
} from "@heygen/liveavatar-web-sdk";

export interface LiveAvatarHandle {
  speak: (text: string) => Promise<void>;
  interrupt: () => void;
  stop: () => Promise<void>;
}

type Status = "idle" | "connecting" | "ready" | "speaking" | "error" | "ended";

interface Props {
  onStateChange?: (s: { speaking: boolean }) => void;
  onError?: (msg: string, opts?: { quotaExhausted?: boolean }) => void;
}

const QUOTA_PATTERN = /quota|credit|insufficient|exhausted|concurrent.*limit|billing|exceeded/i;

export const LiveAvatar = forwardRef<LiveAvatarHandle, Props>(function LiveAvatar(
  { onStateChange, onError },
  ref,
) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const speakResolveRef = useRef<(() => void) | null>(null);

  const start = useCallback(async () => {
    if (sessionRef.current) return;
    setStatus("connecting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/liveavatar-token", { method: "POST" });
      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as {
          error?: string;
          quotaExhausted?: boolean;
        };
        const msg = e.error || `Token error: ${res.status}`;
        const isQuota = e.quotaExhausted || res.status === 402 || res.status === 429;
        setErrorMsg(msg);
        setStatus("error");
        onError?.(msg, { quotaExhausted: isQuota });
        sessionRef.current = null;
        return;
      }
      const { sessionToken } = (await res.json()) as { sessionToken: string };

      const session = new LiveAvatarSession(sessionToken, { voiceChat: false });
      sessionRef.current = session;

      session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        setStatus("speaking");
        onStateChange?.({ speaking: true });
      });
      session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
        setStatus("ready");
        onStateChange?.({ speaking: false });
        if (speakResolveRef.current) {
          speakResolveRef.current();
          speakResolveRef.current = null;
        }
      });
      session.on(SessionEvent.SESSION_STATE_CHANGED, (state: SessionState) => {
        if (state === SessionState.DISCONNECTED) setStatus("ended");
      });
      session.on(SessionEvent.SESSION_DISCONNECTED, () => setStatus("ended"));

      await session.start();
      if (videoRef.current) session.attach(videoRef.current);
      setStatus("ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "LiveAvatar failed to start";
      setErrorMsg(msg);
      setStatus("error");
      onError?.(msg, { quotaExhausted: QUOTA_PATTERN.test(msg) });
      sessionRef.current = null;
    }
  }, [onError, onStateChange]);

  const stop = useCallback(async () => {
    if (!sessionRef.current) return;
    try {
      await sessionRef.current.stop();
    } catch {
      /* ignore */
    }
    sessionRef.current = null;
    setStatus("ended");
    onStateChange?.({ speaking: false });
  }, [onStateChange]);

  const speak = useCallback(async (text: string) => {
    const s = sessionRef.current;
    if (!s) return;
    return new Promise<void>((resolve) => {
      speakResolveRef.current = resolve;
      try {
        s.repeat(text);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "speak failed";
        setErrorMsg(msg);
        onError?.(msg);
        speakResolveRef.current = null;
        resolve();
      }
    });
  }, [onError]);

  const interrupt = useCallback(() => {
    if (!sessionRef.current) return;
    try {
      sessionRef.current.interrupt();
    } catch {
      /* ignore */
    }
  }, []);

  useImperativeHandle(ref, () => ({ speak, interrupt, stop }), [speak, interrupt, stop]);

  useEffect(() => {
    start();
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[color:var(--color-paper-3)] hairline" style={{ width: 320, height: 360 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
      />
      {status !== "ready" && status !== "speaking" && (
        <div className="absolute inset-0 flex items-center justify-center text-center px-6 text-sm text-[color:var(--color-ink-3)] bg-[color:var(--color-paper-3)]">
          {status === "connecting" && "Connecting to LiveAvatar…"}
          {status === "idle" && "Initializing…"}
          {status === "ended" && "Session ended."}
          {status === "error" && (
            <div>
              <p className="text-[color:var(--color-danger)] mb-2">LiveAvatar error</p>
              <p className="text-xs text-[color:var(--color-ink-4)]">{errorMsg}</p>
              <button
                type="button"
                onClick={start}
                className="mt-3 px-3 py-1.5 rounded-full hairline text-xs hover:bg-[color:var(--color-paper-2)] ease-standard transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
