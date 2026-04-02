export interface RenderContext {
  [key: string]: string | number | boolean | string[];
}

const LIST_PATTERN = /\{\{#list\s+([a-zA-Z0-9_.-]+)\}\}/g;
const SCALAR_PATTERN = /\{\{([a-zA-Z0-9_.-]+)\}\}/g;
const REMAINING_PATTERN = /\{\{([^}]+)\}\}/g;

export function renderTemplate(template: string, context: RenderContext): string {
  let rendered = template.replace(LIST_PATTERN, (_, key: string) => {
    const value = context[key];

    if (!Array.isArray(value)) {
      throw new Error(`Expected "${key}" to be a list placeholder.`);
    }

    return value.map((item) => `- ${item}`).join("\n");
  });

  rendered = rendered.replace(SCALAR_PATTERN, (_, key: string) => {
    const value = context[key];

    if (Array.isArray(value)) {
      throw new Error(`Expected "${key}" to be a scalar placeholder.`);
    }
    if (value === undefined) {
      throw new Error(`Missing template value for "${key}".`);
    }

    return String(value);
  });

  const remaining = rendered.match(REMAINING_PATTERN);
  if (remaining) {
    throw new Error(`Unresolved template placeholders: ${remaining.join(", ")}`);
  }

  return rendered;
}
