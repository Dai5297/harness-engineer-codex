import { access, mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { constants, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { ensureTrailingNewline } from "./format.js";
import { joinPath } from "./path.js";

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

export async function readTextFile(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

export async function writeTextFile(filePath: string, contents: string): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, ensureTrailingNewline(contents), "utf8");
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

export async function listDirectoryEntries(dirPath: string): Promise<string[]> {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  const entries = await readdir(dirPath);
  return entries.sort((left, right) => left.localeCompare(right));
}

export async function listMarkdownSlugs(dirPath: string): Promise<string[]> {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  const items = await readdir(dirPath, { withFileTypes: true });

  return items
    .filter((item) => item.isFile() && item.name.endsWith(".md") && item.name !== "README.md" && item.name !== "template.md")
    .map((item) => item.name.slice(0, -3))
    .sort((left, right) => left.localeCompare(right));
}

export function listFilesRecursivelySync(rootDir: string): string[] {
  const entries = readdirSync(rootDir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const relativePath = entry.name;

    if (entry.isDirectory()) {
      for (const child of listFilesRecursivelySync(join(rootDir, entry.name))) {
        results.push(joinPath(relativePath, child));
      }
      continue;
    }

    if (entry.isFile()) {
      results.push(relativePath);
    }
  }

  return results.sort((left, right) => left.localeCompare(right));
}
