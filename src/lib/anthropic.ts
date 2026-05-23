/**
 * Anthropic SDK wrapper.
 *
 * Direct messages.create / messages.stream calls. The big-ticket
 * optimization here is prompt caching: CV + JD context is large and
 * stable across an interview session, so we tag those system blocks
 * with cache_control: ephemeral and the second+ request reads from
 * cache at ~10% of the cost. A 5-question session lands at roughly
 * $0.05-0.15 in total tokens.
 *
 * Public surface:
 *   - chatCompletion(opts)        → string  (non-streaming)
 *   - chatCompletionStream(opts)  → AsyncIterable<string>  (text deltas)
 *   - extractJSON(text)           → unknown
 *   - MODEL / MODEL_CONFIG        → constants
 */

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.",
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export const MODEL = "claude-opus-4-7" as const;

export const MODEL_CONFIG = {
  questionGeneration: { maxTokens: 2000, temperature: 0.8 },
  answerEvaluation: { maxTokens: 2500, temperature: 0.3 },
  optionGeneration: { maxTokens: 1500, temperature: 0.7 },
  followUp: { maxTokens: 600, temperature: 0.6 },
  summary: { maxTokens: 1500, temperature: 0.5 },
  sessionStart: { maxTokens: 2500, temperature: 0.7 },
} as const;

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
  /**
   * Cache markers, one boolean per system message (in order). Marked
   * blocks get cache_control: ephemeral. Up to 4 cache breakpoints
   * across the whole request; the marker applies to the block AND
   * everything before it, so put cacheable content first.
   */
  cacheSystem?: boolean[];
}

interface SystemBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

function splitMessages(messages: Message[], cacheSystem?: boolean[]) {
  const systemMessages: Message[] = [];
  const nonSystem: { role: "user" | "assistant"; content: string }[] = [];

  for (const m of messages) {
    if (m.role === "system") systemMessages.push(m);
    else nonSystem.push({ role: m.role, content: m.content });
  }

  let system: SystemBlock[] | string | undefined;
  if (systemMessages.length === 1 && !cacheSystem?.[0]) {
    system = systemMessages[0].content;
  } else if (systemMessages.length > 0) {
    system = systemMessages.map((m, i) => {
      const block: SystemBlock = { type: "text", text: m.content };
      if (cacheSystem?.[i]) block.cache_control = { type: "ephemeral" };
      return block;
    });
  }

  return { system, messages: nonSystem };
}

// Claude Opus 4.7 deprecated the `temperature` parameter; passing it
// returns a 400. We keep `temperature` on ChatOptions for forward
// compatibility but only forward it when targeting a non-Opus-4.7 model
// (Sonnet 4.6, Haiku 4.5, older Opus).
function supportsTemperature(model: string): boolean {
  return !model.startsWith("claude-opus-4-7");
}

export async function chatCompletion(opts: ChatOptions): Promise<string> {
  const { system, messages } = splitMessages(opts.messages, opts.cacheSystem);
  const model = opts.model || MODEL;
  const response = await getClient().messages.create({
    model,
    max_tokens: opts.max_tokens || 2000,
    ...(supportsTemperature(model) ? { temperature: opts.temperature ?? 0.7 } : {}),
    system,
    messages,
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function* chatCompletionStream(
  opts: ChatOptions,
): AsyncGenerator<string> {
  const { system, messages } = splitMessages(opts.messages, opts.cacheSystem);
  const model = opts.model || MODEL;
  const stream = getClient().messages.stream({
    model,
    max_tokens: opts.max_tokens || 2500,
    ...(supportsTemperature(model) ? { temperature: opts.temperature ?? 0.3 } : {}),
    system,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

export function extractJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return JSON.parse(fenced[1].trim());
    const objectMatch = text.match(/(\{[\s\S]*\})/);
    const arrayMatch = text.match(/(\[[\s\S]*\])/);
    const match = objectMatch || arrayMatch;
    if (match) return JSON.parse(match[1]);
    throw new Error("Could not extract JSON from response");
  }
}
