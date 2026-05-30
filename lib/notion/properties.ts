type RichTextFragment = {
  plain_text?: unknown;
};

type NotionProperty = {
  type?: unknown;
  title?: unknown;
  rich_text?: unknown;
  select?: unknown;
  multi_select?: unknown;
  status?: unknown;
  number?: unknown;
  checkbox?: unknown;
  date?: unknown;
  people?: unknown;
  url?: unknown;
  email?: unknown;
  phone_number?: unknown;
  relation?: unknown;
};

function plainText(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((fragment: RichTextFragment) =>
      typeof fragment.plain_text === "string" ? fragment.plain_text : "",
    )
    .join("")
    .trim();
}

function namedObjectName(value: unknown) {
  if (!value || typeof value !== "object") {
    return "";
  }

  const name = (value as { name?: unknown }).name;
  return typeof name === "string" ? name : "";
}

export function extractTitle(properties: Record<string, unknown> | undefined, fallback: string) {
  if (!properties) {
    return fallback;
  }

  for (const property of Object.values(properties)) {
    if (!property || typeof property !== "object") {
      continue;
    }

    const typedProperty = property as NotionProperty;

    if (typedProperty.type === "title") {
      const title = plainText(typedProperty.title);
      return title || fallback;
    }
  }

  return fallback;
}

export function normalizeProperties(properties: Record<string, unknown> | undefined) {
  const normalized: Record<string, string | number | boolean | string[]> = {};

  if (!properties) {
    return normalized;
  }

  for (const [name, property] of Object.entries(properties)) {
    if (!property || typeof property !== "object") {
      continue;
    }

    const typedProperty = property as NotionProperty;

    if (typedProperty.type === "title") {
      normalized[name] = plainText(typedProperty.title);
    } else if (typedProperty.type === "rich_text") {
      normalized[name] = plainText(typedProperty.rich_text);
    } else if (typedProperty.type === "select") {
      normalized[name] = namedObjectName(typedProperty.select);
    } else if (typedProperty.type === "multi_select" && Array.isArray(typedProperty.multi_select)) {
      normalized[name] = typedProperty.multi_select.map(namedObjectName).filter(Boolean);
    } else if (typedProperty.type === "status") {
      normalized[name] = namedObjectName(typedProperty.status);
    } else if (typedProperty.type === "number" && typeof typedProperty.number === "number") {
      normalized[name] = typedProperty.number;
    } else if (typedProperty.type === "checkbox" && typeof typedProperty.checkbox === "boolean") {
      normalized[name] = typedProperty.checkbox;
    } else if (typedProperty.type === "url" && typeof typedProperty.url === "string") {
      normalized[name] = typedProperty.url;
    } else if (typedProperty.type === "email" && typeof typedProperty.email === "string") {
      normalized[name] = typedProperty.email;
    } else if (typedProperty.type === "phone_number" && typeof typedProperty.phone_number === "string") {
      normalized[name] = typedProperty.phone_number;
    } else if (typedProperty.type === "date" && typedProperty.date && typeof typedProperty.date === "object") {
      const start = (typedProperty.date as { start?: unknown }).start;
      normalized[name] = typeof start === "string" ? start : "";
    } else if (typedProperty.type === "people" && Array.isArray(typedProperty.people)) {
      normalized[name] = typedProperty.people.map(namedObjectName).filter(Boolean);
    } else if (typedProperty.type === "relation" && Array.isArray(typedProperty.relation)) {
      normalized[name] = typedProperty.relation
        .map((item) => (item && typeof item === "object" ? (item as { id?: unknown }).id : ""))
        .filter((id): id is string => typeof id === "string" && id.length > 0);
    }
  }

  return normalized;
}
