import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { HarnessConfig, HarnessRoleConfig } from "./types.js";
import { getPreset } from "./presets.js";
import { formatJson, pathExists, readJsonFile, sortPaths, toPackageName } from "./utils.js";

export const HARNESS_CONFIG_FILE = "harness-engineer.config.json";

export interface BuildConfigOptions {
  cwd: string;
  targetDir?: string;
  projectName: string;
  presetKey: string;
  language?: HarnessConfig["language"];
  devCommand?: string;
}

export function buildHarnessConfig(options: BuildConfigOptions): HarnessConfig {
  const preset = getPreset(options.presetKey);
  const targetDir = resolve(options.cwd, options.targetDir ?? ".");
  const language = options.language ?? preset.defaultLanguage;
  const roles = preset.roles.map((role) => ({ ...role }));
  const truthSources = preset.truthSources.map((source) => ({ ...source }));
  const config: HarnessConfig = {
    projectName: options.projectName,
    preset: preset.key,
    language,
    version: 1,
    devCommand: options.devCommand ?? null,
    paths: { ...preset.paths },
    roles,
    truthSources,
    managedFiles: [],
  };

  config.managedFiles = sortPaths(
    preset.buildManagedFiles(config).map((entry) => entry.path),
  );

  void targetDir;
  return config;
}

export async function loadHarnessConfig(cwd: string): Promise<HarnessConfig> {
  const configPath = join(cwd, HARNESS_CONFIG_FILE);
  if (!(await pathExists(configPath))) {
    throw new Error(`Missing ${HARNESS_CONFIG_FILE} in ${cwd}. Run "harness-engineer init" first.`);
  }

  return readJsonFile<HarnessConfig>(configPath);
}

export async function readOwnPackageVersion(moduleUrl: string): Promise<string> {
  try {
    const packageJsonUrl = new URL("../package.json", moduleUrl);
    const contents = await readFile(packageJsonUrl, "utf8");
    const parsed = JSON.parse(contents) as { version?: string };
    return parsed.version ?? "latest";
  } catch {
    return "latest";
  }
}

export function buildHarnessDependencyVersion(version: string): string {
  return version === "latest" ? "latest" : `^${version}`;
}

export function createDefaultPackageJson(projectName: string): {
  name: string;
  version: string;
  private: true;
  devDependencies: Record<string, string>;
} {
  return {
    name: toPackageName(projectName),
    version: "0.0.0",
    private: true,
    devDependencies: {},
  };
}

export function serializeHarnessConfig(config: HarnessConfig): string {
  return formatJson(config);
}

export function getRoleByKey(config: HarnessConfig, key: string): HarnessRoleConfig {
  const role = config.roles.find((candidate) => candidate.key === key);
  if (!role) {
    throw new Error(`Unknown role "${key}" in harness config.`);
  }

  return role;
}
