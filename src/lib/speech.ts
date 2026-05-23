/**
 * Browser speech APIs — fallbacks when ElevenLabs / Whisper aren't
 * configured. The session orchestrator picks based on /api/config and
 * the browser's capability.
 */

/* ─── TTS (text → audio playback) ───────────────────────────────────── */

export function speakBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("SpeechSynthesis is not available in this browser."));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(`SpeechSynthesis error: ${e.error}`));
    window.speechSynthesis.speak(utterance);
  });
}

export function cancelBrowserSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Play audio from a Response stream (e.g. /api/tts → ElevenLabs).
 * Resolves when playback ends. Returns the HTMLAudioElement so the
 * caller can attach pause/stop handlers.
 */
export async function playAudioStream(response: Response): Promise<HTMLAudioElement> {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
  audio.addEventListener("ended", () => URL.revokeObjectURL(url));
  return audio;
}

/* ─── STT capability detection ──────────────────────────────────────── */

export function hasBrowserSTT(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
  );
}

export function hasMediaRecorder(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return Boolean(navigator.mediaDevices && typeof MediaRecorder !== "undefined");
}
