import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { google } from "@ai-sdk/google";
import { createProviderRegistry, type LanguageModel } from "ai";

// Provider-agnostic model selection. Add a provider here (groq, mistral, …)
// and it's instantly usable via AI_MODEL="provider:model".
const registry = createProviderRegistry({
  anthropic,
  openai,
  xai,
  google,
});

// Auto-detect default model per provider, by which API key is present.
const DEFAULTS: Record<string, string> = {
  ANTHROPIC_API_KEY: "anthropic:claude-sonnet-4-6",
  OPENAI_API_KEY: "openai:gpt-5",
  XAI_API_KEY: "xai:grok-4",
  GOOGLE_GENERATIVE_AI_API_KEY: "google:gemini-2.5-pro",
};

/**
 * Resolve the chat model:
 *  1. `AI_MODEL="provider:model"` if set (e.g. "openai:gpt-5", "anthropic:claude-sonnet-4-6")
 *  2. else the default for whichever provider key is present
 *  3. else throw a clear error.
 */
type ModelId = Parameters<typeof registry.languageModel>[0];

export function resolveModel(): LanguageModel {
  const explicit = process.env.AI_MODEL?.trim();
  if (explicit) return registry.languageModel(explicit as unknown as ModelId);

  for (const [key, model] of Object.entries(DEFAULTS)) {
    if (process.env[key]) return registry.languageModel(model as unknown as ModelId);
  }

  throw new Error(
    "No AI provider configured. Set one of ANTHROPIC_API_KEY, OPENAI_API_KEY, XAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY (and optionally AI_MODEL='provider:model').",
  );
}
