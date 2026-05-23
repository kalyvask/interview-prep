/**
 * POST /api/tts
 *
 * Body: { text: string, voiceId?: string }
 *
 * Returns: audio/mpeg stream from ElevenLabs.
 *
 * Falls back to a 503 if ELEVENLABS_API_KEY is not set, so the UI can
 * use the browser's SpeechSynthesis API instead.
 */
export async function POST(request: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "ElevenLabs voice is not configured. Set ELEVENLABS_API_KEY in .env.local, or the UI will fall back to the browser's built-in voice.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await request.json();
    const { text, voiceId } = body as { text?: string; voiceId?: string };
    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMAi";

    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      console.error("ElevenLabs error:", upstream.status, errText);
      return new Response(
        JSON.stringify({ error: `ElevenLabs error: ${upstream.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("tts error:", error);
    return new Response(JSON.stringify({ error: "Failed to synthesize speech" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const runtime = "nodejs";
