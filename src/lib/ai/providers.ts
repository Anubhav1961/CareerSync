import { resolveApiKey } from "@/lib/api-key-resolver";
import { PROVIDER_REGISTRY } from "@/lib/ai/provider-registry";
import { PROVIDER_FACTORIES } from "@/lib/ai/provider-registry.server";
import { AIUnavailableError } from "@/lib/ai/tools/errors";

export type ProviderType = "openai" | "ollama" | "deepseek" | "openrouter" | "gemini";

const DEFAULT_MODELS: Record<ProviderType, string> = {
  gemini: "gemini-2.0-flash",
  openai: "gpt-4o-mini",
  deepseek: "deepseek-chat",
  openrouter: "openrouter/auto",
  ollama: "qwen2.5:7b",
};

const CLOUD_PROVIDERS: ProviderType[] = ["gemini", "openai", "deepseek", "openrouter"];

export async function getModel(
  requestedProvider?: ProviderType,
  requestedModel?: string,
  userId?: string,
) {
  let provider: ProviderType = requestedProvider || "ollama";
  let credential = await resolveApiKey(userId, provider);

  const isOllamaDefaultUrl =
    provider === "ollama" &&
    (!process.env.OLLAMA_BASE_URL ||
      process.env.OLLAMA_BASE_URL.includes("127.0.0.1") ||
      process.env.OLLAMA_BASE_URL.includes("localhost") ||
      process.env.OLLAMA_BASE_URL.includes("host.docker.internal"));

  // If using default local Ollama or credential is missing, auto-fallback to cloud providers
  if ((provider === "ollama" && isOllamaDefaultUrl) || !credential) {
    for (const cloudProv of CLOUD_PROVIDERS) {
      const cloudCred = await resolveApiKey(userId, cloudProv);
      if (cloudCred) {
        provider = cloudProv;
        credential = cloudCred;
        break;
      }
    }
  }

  const entry = PROVIDER_REGISTRY[provider];
  if (!entry) throw new AIUnavailableError(`Unknown AI provider: ${provider}`);

  if (!credential) {
    throw new AIUnavailableError(
      "AI Provider not configured. Please add an API key for Google Gemini (GEMINI_API_KEY), OpenAI (OPENAI_API_KEY), DeepSeek (DEEPSEEK_API_KEY), or OpenRouter (OPENROUTER_API_KEY) in environment variables or Settings."
    );
  }

  const factory = PROVIDER_FACTORIES[provider];
  if (!factory) throw new AIUnavailableError(`No factory for provider: ${provider}`);

  const finalModelName = requestedModel || DEFAULT_MODELS[provider] || "gpt-4o-mini";

  return factory(credential, finalModelName);
}
