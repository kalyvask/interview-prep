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
 * No secrets are returned — only booleans and the voice ID.
 */
export async function GET() {
  return NextResponse.json({
    voiceId: process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMAi",
    elevenlabsAvailable: Boolean(process.env.ELEVENLABS_API_KEY),
    whisperAvailable: Boolean(process.env.OPENAI_API_KEY),
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
