import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { buildHarnessConfig, buildHarnessDependencyVersion, createDefaultPackageJson, HARNESS_CONFIG_FILE, serializeHarnessConfig } from "./config.js";
import { getPreset } from "./presets.js";
import type { InitOptions, InitResult } from "./types.js";
import { ensureDir, formatJson, pathExists, readJsonFile, writeTextFile } from "./utils.js";

export async function initProject(options: InitOptions): Promise<InitResult> {
  const targetDir = resolve(options.cwd, options.targetDir ?? ".");
  const preset = getPreset(options.preset);
  const projectName = options.projectName || preset.defaultProjectName;
  const config = buildHarnessConfig({
    cwd: options.cwd,
    targetDir: options.targetDir,
    projectName,
    presetKey: options.preset,
    language: options.language,
    devCommand: options.devCommand,
  });
  const managedEntries = preset.buildManagedFiles(config);
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];
  const overwrittenFiles: string[] = [];

  await ensureDir(targetDir);
  await ensurePackageJson(targetDir, projectName, options.packageVersion ?? "latest");

  const configPath = join(targetDir, HARNESS_CONFIG_FILE);
  await writeManagedFile(configPath, serializeHarnessConfig(config), options.force ?? false, {
    createdFiles,
    skippedFiles,
    overwrittenFiles,
    relativePath: HARNESS_CONFIG_FILE,
  });

  for (const entry of managedEntries) {
    const filePath = join(targetDir, entry.path);
    await writeManagedFile(filePath, entry.content, options.force ?? false, {
      createdFiles,
      skippedFiles,
      overwrittenFiles,
      relativePath: entry.path,
    });
  }

  return {
    targetDir,
    createdFiles,
    skippedFiles,
    overwrittenFiles,
  };
}

async function ensurePackageJson(targetDir: string, projectName: string, packageVersion: string): Promise<void> {
  const packageJsonPath = join(targetDir, "package.json");
  const dependencyVersion = buildHarnessDependencyVersion(packageVersion);
  const packageJson = (await pathExists(packageJsonPath))
    ? await readJsonFile<Record<string, unknown>>(packageJsonPath)
    : createDefaultPackageJson(projectName);

  const devDependencies = {
    ...((packageJson.devDependencies as Record<string, string> | undefined) ?? {}),
    "harness-engineer": dependencyVersion,
  };

  const nextPackageJson = {
    ...packageJson,
    devDependencies,
  };

  await writeTextFile(packageJsonPath, formatJson(nextPackageJson));
}

async function writeManagedFile(
  filePath: string,
  content: string,
  force: boolean,
  collector: {
    createdFiles: string[];
    skippedFiles: string[];
    overwrittenFiles: string[];
    relativePath: string;
  },
): Promise<void> {
  const exists = await pathExists(filePath);
  if (exists && !force) {
    collector.skippedFiles.push(collector.relativePath);
    return;
  }

  await ensureDir(dirname(filePath));
  await writeTextFile(filePath, content);

  if (exists) {
    collector.overwrittenFiles.push(collector.relativePath);
    return;
  }

  collector.createdFiles.push(collector.relativePath);
}
