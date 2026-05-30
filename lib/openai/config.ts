export function getOpenAiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    imageModel: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
  };
}

export function assertOpenAiConfigured() {
  const config = getOpenAiConfig();

  if (!config.apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return config;
}
