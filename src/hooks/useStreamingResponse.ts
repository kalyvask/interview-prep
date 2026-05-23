"use client";

import { useState, useCallback } from "react";

interface StreamState {
  streamedText: string;
  isStreaming: boolean;
  error: string | null;
  evaluation: unknown | null;
}

export function useStreamingResponse() {
  const [state, setState] = useState<StreamState>({
    streamedText: "",
    isStreaming: false,
    error: null,
    evaluation: null,
  });

  const startStream = useCallback(async (url: string, body: unknown) => {
    setState({ streamedText: "", isStreaming: true, error: null, evaluation: null });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        setState((s) => ({ ...s, isStreaming: false, error: err.error || "Request failed" }));
        return null;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setState((s) => ({ ...s, isStreaming: false, error: "No response stream" }));
        return null;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let finalEvaluation: unknown = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              setState((s) => ({ ...s, isStreaming: false, error: data.error }));
              return null;
            }
            if (data.done) {
              finalEvaluation = data.evaluation || null;
            } else if (data.text) {
              setState((s) => ({ ...s, streamedText: s.streamedText + data.text }));
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      setState((s) => ({ ...s, isStreaming: false, evaluation: finalEvaluation }));
      return finalEvaluation;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stream failed";
      setState((s) => ({ ...s, isStreaming: false, error: message }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ streamedText: "", isStreaming: false, error: null, evaluation: null });
  }, []);

  return { ...state, startStream, reset };
}
