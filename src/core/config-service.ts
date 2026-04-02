import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { BuildConfigOptions, HarnessConfig } from "../types/harness.js";
import { listManagedTemplatePaths, getPreset } from "./preset-registry.js";
import { formatJson, toPackageName } from "../utils/format.js";
import { pathExists, readJsonFile, readTextFile } from "../utils/fs.js";

export const HARNESS_CONFIG_FILE = "harness-engineer.config.json";

export function buildHarnessConfig(options: BuildConfigOptions): HarnessConfig {
  const preset = getPreset(options.presetKey);

  return {
    projectName: options.projectName,
    preset: preset.key,
    language: options.language ?? preset.defaultLanguage,
    version: 2,
    paths: { ...preset.paths },
    roles: preset.roles.map((role) => ({
      ...role,
      owns: [...role.owns],
      outputs: [...role.outputs],
    })),
    managedFiles: listManagedTemplatePaths(preset),
  };
}

export async function loadHarnessConfig(cwd: string): Promise<HarnessConfig> {
  const configPath = join(cwd, HARNESS_CONFIG_FILE);
  if (!(await pathExists(configPath))) {
    throw new Error(`Missing ${HARNESS_CONFIG_FILE} in ${cwd}. Run "harness-engineer init" first.`);
  }

  return readJsonFile<HarnessConfig>(configPath);
}

export function serializeHarnessConfig(config: HarnessConfig): string {
  return formatJson(config);
}

export async function readOwnPackageVersion(moduleUrl: string): Promise<string> {
  try {
    const startPath = dirname(fileURLToPath(moduleUrl));
    let currentDir = startPath;

    for (let step = 0; step < 6; step += 1) {
      const packageJsonPath = join(currentDir, "package.json");
      if (await pathExists(packageJsonPath)) {
        const contents = await readTextFile(packageJsonPath);
        const parsed = JSON.parse(contents) as { version?: string };
        return parsed.version ?? "latest";
      }

      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }
  } catch {
    return "latest";
  }

  return "latest";
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
