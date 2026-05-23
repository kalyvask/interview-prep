import { NextResponse } from "next/server";
import { scoreVoice } from "@/lib/voice";

/**
 * POST /api/transcribe
 *
 * Multipart form:
 *   - audio: Blob (audio/webm)
 *   - durationMs: number (string in form)
 *   - targetWindowSec: number (string in form)
 *
 * Uses OpenAI Whisper (whisper-1) when OPENAI_API_KEY is set; otherwise
 * returns a 503 with an actionable error so the UI can fall back to
 * free-text input.
 *
 * Response: { transcript: string, voice: VoiceCapture }
 */
export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Voice mode requires OPENAI_API_KEY (used for Whisper transcription). Set it in .env.local and restart the dev server.",
      },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as Blob | null;
    const durationMsRaw = formData.get("durationMs");
    const targetWindowSecRaw = formData.get("targetWindowSec");

    if (!audio) {
      return NextResponse.json({ error: "Missing audio blob" }, { status: 400 });
    }

    const durationMs = Number(durationMsRaw ?? 0) || 0;
    const targetWindowSec = Number(targetWindowSecRaw ?? 90) || 90;

    // Forward to OpenAI Whisper
    const upstream = new FormData();
    upstream.append("file", audio, "answer.webm");
    upstream.append("model", "whisper-1");
    upstream.append("response_format", "json");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: upstream,
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Whisper error:", res.status, errBody);
      return NextResponse.json(
        { error: `Whisper API error: ${res.status}` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { text?: string };
    const transcript = (data.text || "").trim();
    if (!transcript) {
      return NextResponse.json({ error: "Whisper returned empty transcript" }, { status: 502 });
    }

    const voice = scoreVoice({ transcript, durationMs, targetWindowSec });
    return NextResponse.json({ transcript, voice });
  } catch (error) {
    console.error("transcribe error:", error);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 502 });
  }
}

// Larger body for audio uploads
export const runtime = "nodejs";
