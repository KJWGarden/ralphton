import { assertNotionConfigured } from "@/lib/notion/config";
import { notionErrorFromStatus } from "@/lib/notion/errors";

type NotionRequestOptions = {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  source: "page" | "data_source";
};

const notionBaseUrl = "https://api.notion.com/v1";

export async function notionFetch<T>(path: string, options: NotionRequestOptions) {
  const config = assertNotionConfigured();
  const response = await fetch(`${notionBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "Notion-Version": config.version,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw notionErrorFromStatus(response.status, options.source);
  }

  return response.json() as Promise<T>;
}
