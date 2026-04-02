import { join } from "node:path";

export function joinPath(...segments: string[]): string {
  return join(...segments).replaceAll("\\", "/");
}

export function sortPaths(paths: Iterable<string>): string[] {
  return [...paths].sort((left, right) => left.localeCompare(right));
}
