import { basename, resolve } from "node:path";

export function ensureTrailingNewline(contents: string): string {
  return contents.endsWith("\n") ? contents : `${contents}\n`;
}

export function formatJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function dedent(text: string): string {
  const trimmed = text.replace(/^\n+|\n+$/g, "");
  const lines = trimmed.split("\n");
  const indent = lines
    .filter((line) => line.trim().length > 0)
    .reduce<number>((current, line) => {
      const match = /^(\s*)/.exec(line);
      const nextIndent = match?.[1]?.length ?? 0;
      return Math.min(current, nextIndent);
    }, Number.POSITIVE_INFINITY);

  const normalizedIndent = Number.isFinite(indent) ? indent : 0;

  return lines.map((line) => line.slice(normalizedIndent)).join("\n");
}

export function toPackageName(projectName: string): string {
  const normalized = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : "harness-project";
}

export function inferProjectName(cwd: string, targetDir: string): string {
  const resolved = resolve(cwd, targetDir);
  const directoryName = basename(resolved);
  const fallback = directoryName.length > 0 ? directoryName : "Harness Project";

  return fallback
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((token) => token[0]?.toUpperCase() + token.slice(1))
    .join(" ");
}
