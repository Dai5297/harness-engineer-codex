import { join, resolve } from "node:path";

import { HARNESS_CONFIG_FILE } from "./config-service.js";
import type { WorkspaceKind } from "../types/harness.js";
import { isDirectory, listDirectoryEntries, pathExists } from "../utils/fs.js";

export interface DirectoryInspection {
  targetDir: string;
  exists: boolean;
  isEmpty: boolean;
  entries: string[];
  needsConfirmation: boolean;
  workspaceKind: WorkspaceKind;
  hasProjectSignals: boolean;
  projectSignals: string[];
}

export async function inspectTargetDirectory(cwd: string, targetDir: string): Promise<DirectoryInspection> {
  const absoluteTargetDir = resolve(cwd, targetDir);
  const exists = await pathExists(absoluteTargetDir);

  if (!exists) {
    return {
      targetDir: absoluteTargetDir,
      exists: false,
      isEmpty: true,
      entries: [],
      needsConfirmation: false,
      workspaceKind: "empty",
      hasProjectSignals: false,
      projectSignals: [],
    };
  }

  if (!(await isDirectory(absoluteTargetDir))) {
    throw new Error(`Target path "${targetDir}" exists and is not a directory.`);
  }

  const entries = await listDirectoryEntries(absoluteTargetDir);
  const hasHarnessConfig = await pathExists(join(absoluteTargetDir, HARNESS_CONFIG_FILE));
  const projectSignals = detectProjectSignals(entries);

  return {
    targetDir: absoluteTargetDir,
    exists: true,
    isEmpty: entries.length === 0,
    entries,
    needsConfirmation: entries.length > 0,
    workspaceKind: hasHarnessConfig ? "scaffolded" : entries.length === 0 ? "empty" : "existing",
    hasProjectSignals: projectSignals.length > 0,
    projectSignals,
  };
}

const PROJECT_SIGNAL_NAMES = new Set([
  ".git",
  "README",
  "README.md",
  "README.txt",
  "app",
  "apps",
  "Cargo.toml",
  "composer.json",
  "Dockerfile",
  "Gemfile",
  "go.mod",
  "lib",
  "package.json",
  "packages",
  "pnpm-workspace.yaml",
  "pom.xml",
  "pyproject.toml",
  "requirements.txt",
  "src",
  "tsconfig.json",
  "turbo.json",
  "vite.config.ts",
  "vite.config.js",
]);

function detectProjectSignals(entries: string[]): string[] {
  return entries.filter((entry) => PROJECT_SIGNAL_NAMES.has(entry)).sort((left, right) => left.localeCompare(right));
}
