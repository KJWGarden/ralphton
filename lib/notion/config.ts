export function getNotionConfig() {
  return {
    token: process.env.NOTION_TOKEN,
    version: process.env.NOTION_VERSION ?? "2026-03-11",
  };
}

export function assertNotionConfigured() {
  const config = getNotionConfig();

  if (!config.token) {
    throw new Error("NOTION_TOKEN is not configured");
  }

  return config;
}
