const compactIdPattern = /[0-9a-f]{32}/i;
const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function compactId(value: string) {
  return value.replaceAll("-", "").toLowerCase();
}

export function formatNotionId(value: string) {
  const compact = compactId(value);

  if (!compactIdPattern.test(compact) || compact.length !== 32) {
    return null;
  }

  return [
    compact.slice(0, 8),
    compact.slice(8, 12),
    compact.slice(12, 16),
    compact.slice(16, 20),
    compact.slice(20),
  ].join("-");
}

export function extractNotionId(input: string) {
  const value = input.trim();

  if (!value) {
    return null;
  }

  const directUuid = value.match(uuidPattern)?.[0];

  if (directUuid) {
    return formatNotionId(directUuid);
  }

  try {
    const url = new URL(value);
    const pageParam = url.searchParams.get("p") ?? url.searchParams.get("pageId");
    const paramUuid = pageParam?.match(uuidPattern)?.[0] ?? pageParam?.match(compactIdPattern)?.[0];

    if (paramUuid) {
      return formatNotionId(paramUuid);
    }
  } catch {
    // Plain Notion IDs are valid input, so non-URL values continue below.
  }

  const compactMatch = value.match(compactIdPattern)?.[0];
  return compactMatch ? formatNotionId(compactMatch) : null;
}
