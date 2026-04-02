import { join, resolve } from "node:path";

import type { GeneratedFile, InitOptions, InitResult } from "../types/harness.js";
import { buildHarnessConfig, buildHarnessDependencyVersion, createDefaultPackageJson, HARNESS_CONFIG_FILE, serializeHarnessConfig } from "./config-service.js";
import { getPreset } from "./preset-registry.js";
import { writeGeneratedFiles } from "./scaffold-writer.js";
import { loadManagedTemplateFiles } from "./template-loader.js";
import { formatJson } from "../utils/format.js";
import { pathExists, readJsonFile } from "../utils/fs.js";

export async function initProject(options: InitOptions): Promise<InitResult> {
  const presetKey = options.preset ?? "generic-software";
  const preset = getPreset(presetKey);
  const targetDir = resolve(options.cwd, options.targetDir ?? ".");
  const projectName = options.projectName?.trim() || preset.defaultProjectName;

  const config = buildHarnessConfig({
    cwd: options.cwd,
    targetDir: options.targetDir,
    projectName,
    presetKey,
    language: options.language,
  });

  const templateFiles = await loadManagedTemplateFiles(preset, config);
  const packageJsonFile = await buildPackageJsonFile(
    targetDir,
    projectName,
    options.packageVersion ?? "latest",
  );

  const files: GeneratedFile[] = [
    {
      path: "package.json",
      content: packageJsonFile,
    },
    {
      path: HARNESS_CONFIG_FILE,
      content: serializeHarnessConfig(config),
    },
    ...templateFiles,
  ];

  const summary = await writeGeneratedFiles(targetDir, files, {
    force: Boolean(options.force),
    dryRun: Boolean(options.dryRun),
    alwaysWritePaths: new Set(["package.json"]),
  });

  return {
    targetDir,
    ...summary,
    dryRun: Boolean(options.dryRun),
  };
}

async function buildPackageJsonFile(targetDir: string, projectName: string, packageVersion: string): Promise<string> {
  const packageJsonPath = join(targetDir, "package.json");
  const basePackageJson = (await pathExists(packageJsonPath))
    ? await readJsonFile<Record<string, unknown>>(packageJsonPath)
    : createDefaultPackageJson(projectName);

  const existingDevDependencies = isRecord(basePackageJson.devDependencies)
    ? basePackageJson.devDependencies
    : {};

  const packageName = typeof basePackageJson.name === "string" && basePackageJson.name.length > 0
    ? basePackageJson.name
    : createDefaultPackageJson(projectName).name;

  const nextPackageJson = {
    ...basePackageJson,
    name: packageName,
    devDependencies: {
      ...existingDevDependencies,
      "harness-engineer": buildHarnessDependencyVersion(packageVersion),
    },
  };

  return formatJson(nextPackageJson);
}

function isRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null;
}
