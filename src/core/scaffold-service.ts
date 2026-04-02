import { join, resolve } from "node:path";

import type { GeneratedFile, HarnessConfig, HarnessLanguage, InitResult, ManagedWriteMode } from "../types/harness.js";
import {
  buildHarnessConfig,
  buildHarnessDependencyVersion,
  createDefaultPackageJson,
  HARNESS_CONFIG_FILE,
  serializeHarnessConfig,
} from "./config-service.js";
import { getPreset } from "./preset-registry.js";
import { writeGeneratedFiles } from "./scaffold-writer.js";
import { loadManagedTemplateFiles } from "./template-loader.js";
import { formatJson } from "../utils/format.js";
import { pathExists, readJsonFile } from "../utils/fs.js";

interface ScaffoldProjectOptions {
  cwd: string;
  targetDir?: string;
  projectName?: string;
  preset?: string;
  language?: HarnessLanguage;
  packageVersion?: string;
  dryRun?: boolean;
  includePackageJson: boolean;
  managedWriteMode: ManagedWriteMode;
  alwaysWritePaths?: ReadonlySet<string>;
}

export interface ScaffoldProjectResult extends InitResult {
  config: HarnessConfig;
}

export async function scaffoldProject(options: ScaffoldProjectOptions): Promise<ScaffoldProjectResult> {
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

  const files = await buildGeneratedFiles({
    config,
    packageVersion: options.packageVersion ?? "latest",
    targetDir,
    includePackageJson: options.includePackageJson,
  });

  const summary = await writeGeneratedFiles(targetDir, files, {
    mode: options.managedWriteMode,
    dryRun: Boolean(options.dryRun),
    alwaysWritePaths: options.alwaysWritePaths,
  });

  return {
    targetDir,
    config,
    ...summary,
    dryRun: Boolean(options.dryRun),
  };
}

async function buildGeneratedFiles(options: {
  config: HarnessConfig;
  targetDir: string;
  packageVersion: string;
  includePackageJson: boolean;
}): Promise<GeneratedFile[]> {
  const preset = getPreset(options.config.preset);
  const templateFiles = await loadManagedTemplateFiles(preset, options.config);
  const files: GeneratedFile[] = [
    {
      path: HARNESS_CONFIG_FILE,
      content: serializeHarnessConfig(options.config),
    },
    ...templateFiles,
  ];

  if (options.includePackageJson) {
    files.unshift({
      path: "package.json",
      content: await buildPackageJsonFile(
        options.targetDir,
        options.config.projectName,
        options.packageVersion,
      ),
    });
  }

  return files;
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
