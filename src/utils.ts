import { access, mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export async function writeTextFile(filePath: string, contents: string): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, ensureTrailingNewline(contents), "utf8");
}

export function ensureTrailingNewline(contents: string): string {
  return contents.endsWith("\n") ? contents : `${contents}\n`;
}

export function formatJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function toPackageName(projectName: string): string {
  const normalized = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : "harness-project";
}

export function escapeTomlString(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}

export function renderTomlArray(items: string[]): string {
  return `[\n${items.map((item) => `  "${escapeTomlString(item)}",`).join("\n")}\n]`;
}

export function sortPaths(paths: Iterable<string>): string[] {
  return [...paths].sort((left, right) => left.localeCompare(right));
}

export async function listMarkdownSlugs(dirPath: string): Promise<string[]> {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  const items = await readdir(dirPath, { withFileTypes: true });

  return items
    .filter((item) => item.isFile() && item.name.endsWith(".md") && item.name !== "README.md")
    .map((item) => item.name.slice(0, -3))
    .sort((left, right) => left.localeCompare(right));
}

export async function listDirectories(dirPath: string): Promise<string[]> {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  const items = await readdir(dirPath, { withFileTypes: true });

  return items
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .sort((left, right) => left.localeCompare(right));
}

export async function fileContentEquals(filePath: string, expected: string): Promise<boolean> {
  if (!(await pathExists(filePath))) {
    return false;
  }

  const actual = await readFile(filePath, "utf8");
  return actual === ensureTrailingNewline(expected);
}

export async function movePath(sourcePath: string, destinationPath: string): Promise<void> {
  await ensureDir(dirname(destinationPath));
  await rename(sourcePath, destinationPath);
}

export async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const info = await stat(dirPath);
    return info.isDirectory();
  } catch {
    return false;
  }
}

export function joinLines(lines: Array<string | false | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

export function relativePathList(basePaths: string[]): string {
  return basePaths.map((path) => `- \`${path}\``).join("\n");
}

export function dedent(text: string): string {
  const trimmed = text.replace(/^\n+|\n+$/g, "");
  const lines = trimmed.split("\n");
  const indent = lines
    .filter((line) => line.trim().length > 0)
    .reduce<number>((current, line) => {
      const match = /^(\s*)/.exec(line);
      const lineIndent = match?.[1]?.length ?? 0;
      return Math.min(current, lineIndent);
    }, Number.POSITIVE_INFINITY);

  const normalizedIndent = Number.isFinite(indent) ? indent : 0;

  return lines.map((line) => line.slice(normalizedIndent)).join("\n");
}

export function joinPath(...segments: string[]): string {
  return join(...segments).replaceAll("\\", "/");
}
