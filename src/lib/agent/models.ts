import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

const baseURL =
  process.env.DOCKER_MODEL_BASE_URL ||
  process.env.DMR_BASE_URL ||
  "http://localhost:12434/engines/llama.cpp/v1";

const llmModel =
  process.env.LLM_MODEL_NAME ||
  process.env.DMR_MODEL ||
  "ai/gemma3:1b-q4_K_M";

const embeddingModel =
  process.env.EMBEDDING_MODEL_NAME ||
  process.env.DMR_EMD_MODEL ||
  "ai/mxbai-embed-large";

// Gemma chat model configured to run locally via Docker Model Runner
export const gemmaChatModel = new ChatOpenAI({
  model: llmModel,
  apiKey: "docker-model-runner-local",
  configuration: {
    baseURL,
  },
  temperature: 0.1,
});

// Resolves candidate embedding endpoints with fallbacks.
function getEmbeddingCandidates(): string[] {
  const cleanBase = baseURL.replace(/\/+$/, "");
  const candidates: string[] = [];

  if (cleanBase.endsWith("/embeddings")) {
    candidates.push(cleanBase);
  } else {
    candidates.push(`${cleanBase}/embeddings`);
  }

  candidates.push("http://localhost:12434/engines/v1/embeddings");
  candidates.push("http://localhost:12434/engines/llama.cpp/v1/embeddings");

  return Array.from(new Set(candidates));
}

let activeEmbeddingEndpoint: string | null = null;

//Generates an embedding vector for search queries using the local embedding model.
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const endpoints = activeEmbeddingEndpoint
    ? [activeEmbeddingEndpoint]
    : getEmbeddingCandidates();

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: embeddingModel,
          input: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Embedding request failed (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        data?: Array<{ embedding: number[] }>;
      };

      if (!data.data || !data.data[0] || !Array.isArray(data.data[0].embedding)) {
        throw new Error(`Invalid embedding structure: ${JSON.stringify(data)}`);
      }

      activeEmbeddingEndpoint = endpoint;
      return data.data[0].embedding;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (activeEmbeddingEndpoint) break;
    }
  }

  throw new Error(
    `Failed to generate query embedding: ${lastError?.message || "Unknown error"}`
  );
}
