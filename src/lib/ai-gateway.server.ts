import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

/**
 * Two supported ways to run the AI:
 *
 * 1. Lovable AI Gateway (default when LOVABLE_API_KEY is present) — no key setup
 *    needed when publishing from Lovable.
 * 2. Your own Google Gemini key (GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY) —
 *    used automatically when there is no LOVABLE_API_KEY, e.g. on Vercel.
 */

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    // Required so structured-output calls send a strict json_schema instead of
    // falling back to plain text (which fails schema validation).
    supportsStructuredOutputs: true,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    supportsStructuredOutputs: true,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export const CHAT_MODEL = "google/gemini-2.5-flash";
const GEMINI_CHAT_MODEL = "gemini-2.5-flash";

function geminiKey(): string | undefined {
  return (
    process.env["GEMINI_API_KEY"] ??
    process.env["GOOGLE_GENERATIVE_AI_API_KEY"] ??
    process.env["GOOGLE_AI_API_KEY"]
  );
}

export function requireAiKey(): string {
  const key = process.env["LOVABLE_API_KEY"] ?? geminiKey();
  if (!key) {
    throw new Error(
      "AI service is not configured (set LOVABLE_API_KEY or GEMINI_API_KEY).",
    );
  }
  return key;
}

/** Returns the chat model to use, picking whichever provider is configured. */
export function getChatModel(): LanguageModel {
  const lovable = process.env["LOVABLE_API_KEY"];
  if (lovable) return createLovableAiGatewayProvider(lovable)(CHAT_MODEL);
  const gemini = geminiKey();
  if (gemini) return createGeminiProvider(gemini)(GEMINI_CHAT_MODEL);
  throw new Error(
    "AI service is not configured (set LOVABLE_API_KEY or GEMINI_API_KEY).",
  );
}
