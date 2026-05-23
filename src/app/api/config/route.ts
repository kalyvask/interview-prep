import { NextResponse } from "next/server";

/**
 * GET /api/config
 *
 * Tells the client which capabilities are available based on which env
 * vars are set. The UI uses this to decide whether to call /api/tts
 * (ElevenLabs) or fall back to the browser's SpeechSynthesis, and
 * whether to use /api/transcribe (Whisper) or the browser's
 * SpeechRecognition.
 *
 * No secrets are returned — only booleans and the voice ID. The voice ID
 * is sanity-checked before being echoed: if the env var looks like an
 * API key (starts with `sk_` / `sk-`, or is longer than 30 chars),
 * we silently fall back to the default and log a warning. Voice IDs in
 * the ElevenLabs library are ~20-char alphanumeric strings.
 */
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMAi"; // Sarah
const VALID_VOICE_ID = /^[A-Za-z0-9]{15,30}$/;

function safeVoiceId(): string {
  const raw = process.env.ELEVENLABS_VOICE_ID;
  if (!raw) return DEFAULT_VOICE_ID;
  if (raw.startsWith("sk_") || raw.startsWith("sk-")) {
    console.warn(
      "[config] ELEVENLABS_VOICE_ID looks like an API key (starts with sk_/sk-). Ignoring and using default. Check .env.local.",
    );
    return DEFAULT_VOICE_ID;
  }
  if (!VALID_VOICE_ID.test(raw)) {
    console.warn(
      "[config] ELEVENLABS_VOICE_ID does not match the expected 15-30 char alphanumeric shape. Ignoring and using default. Check .env.local.",
    );
    return DEFAULT_VOICE_ID;
  }
  return raw;
}

export async function GET() {
  return NextResponse.json({
    voiceId: safeVoiceId(),
    elevenlabsAvailable: Boolean(process.env.ELEVENLABS_API_KEY),
    whisperAvailable: Boolean(process.env.OPENAI_API_KEY),
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
