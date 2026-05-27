/**
 * POST /api/liveavatar-token
 *
 * Mints a session token for the HeyGen LiveAvatar SDK. The browser SDK
 * (`@heygen/liveavatar-web-sdk`) takes this token in its constructor and
 * uses it as a Bearer auth for the LiveAvatar control plane and to
 * connect the underlying LiveKit WebRTC stream.
 *
 * Returns 503 when LIVEAVATAR_API_KEY or LIVEAVATAR_AVATAR_ID is unset,
 * so the UI can fall back to the SVG face.
 */
export async function POST() {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  const avatarId = process.env.LIVEAVATAR_AVATAR_ID;

  if (!apiKey || !avatarId) {
    return new Response(
      JSON.stringify({
        error:
          "LiveAvatar not configured. Set LIVEAVATAR_API_KEY and LIVEAVATAR_AVATAR_ID in .env.local.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const quality = (process.env.LIVEAVATAR_QUALITY || "high").toLowerCase();
  const sandbox = (process.env.LIVEAVATAR_SANDBOX || "true").toLowerCase() !== "false";

  try {
    const upstream = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "LITE",
        avatar_id: avatarId,
        is_sandbox: sandbox,
        video_settings: { quality, encoding: "H264" },
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok || !data?.data?.session_token) {
      console.error("LiveAvatar token error:", upstream.status, data);
      const message: string = data?.message || `LiveAvatar error (HTTP ${upstream.status})`;
      const quotaExhausted =
        upstream.status === 402 ||
        upstream.status === 429 ||
        /quota|credit|insufficient|exhausted|concurrent.*limit|billing|exceeded/i.test(message);
      return new Response(
        JSON.stringify({ error: message, quotaExhausted }),
        {
          status: quotaExhausted ? 402 : 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        sessionToken: data.data.session_token as string,
        sessionId: data.data.session_id as string,
      }),
      { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("liveavatar-token error:", e);
    return new Response(JSON.stringify({ error: "Failed to mint LiveAvatar token" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const runtime = "nodejs";
