import { resolve } from "node:path";

import type { EnrichOptions, EnrichResult, HarnessLanguage } from "../types/harness.js";
import { buildCodexEnrichPrompt } from "./enrich-prompt.js";
import { checkCodexAvailability, resolveCodexCommand, runCodexExec } from "./codex-runner.js";
import { loadOptionalHarnessConfig } from "./config-service.js";
import { scaffoldProject } from "./scaffold-service.js";
import { inspectTargetDirectory } from "./workspace-service.js";
import { inferProjectName } from "../utils/format.js";

export async function enrichProject(options: EnrichOptions): Promise<EnrichResult> {
  const targetDir = resolve(options.cwd, options.targetDir ?? ".");
  const inspection = await inspectTargetDirectory(options.cwd, options.targetDir ?? ".");

  if (inspection.workspaceKind === "empty") {
    throw new Error(`Target directory "${options.targetDir ?? "."}" looks empty. Use "harness init" to create a fresh scaffold first.`);
  }

  if (inspection.workspaceKind === "existing" && !inspection.hasProjectSignals) {
    throw new Error(
      `Target directory "${options.targetDir ?? "."}" does not look like an existing project yet. Use "harness init" or add the project files first.`,
    );
  }

  const existingConfig = await loadOptionalHarnessConfig(targetDir);
  const scaffold = await scaffoldProject({
    cwd: options.cwd,
    targetDir: options.targetDir,
    projectName: resolveProjectName(options, existingConfig?.projectName),
    preset: options.preset ?? existingConfig?.preset,
    language: resolveLanguage(options.language, existingConfig?.language),
    packageVersion: options.packageVersion,
    dryRun: options.dryRun,
    includePackageJson: false,
    managedWriteMode: options.force ? "force-managed" : "create-missing",
  });

  if (options.dryRun) {
    return {
      targetDir: scaffold.targetDir,
      createdFiles: scaffold.createdFiles,
      skippedFiles: scaffold.skippedFiles,
      overwrittenFiles: scaffold.overwrittenFiles,
      dryRun: true,
      workspaceKind: inspection.workspaceKind,
      codex: null,
    };
  }

  const command = resolveCodexCommand(options.codexEnv, options.codexCommand);
  const availability = await checkCodexAvailability(command, options.codexEnv);
  if (!availability.available) {
    const details = availability.reason ? ` ${availability.reason}` : "";
    throw new Error(
      `Codex CLI is required for "harness enrich" but is not available at "${availability.command}".${details} ${availability.suggestedNextStep}`,
    );
  }

  const codex = await runCodexExec({
    cwd: targetDir,
    prompt: buildCodexEnrichPrompt(scaffold.config),
    command,
    env: options.codexEnv,
  });

  if (codex.exitCode !== 0) {
    const stderr = codex.stderr.trim();
    const suffix = stderr.length > 0 ? `\n${stderr}` : "";
    throw new Error(`Codex enrichment failed with exit code ${codex.exitCode}.${suffix}`);
  }

  return {
    targetDir: scaffold.targetDir,
    createdFiles: scaffold.createdFiles,
    skippedFiles: scaffold.skippedFiles,
    overwrittenFiles: scaffold.overwrittenFiles,
    dryRun: false,
    workspaceKind: inspection.workspaceKind,
    codex,
  };
}

function resolveProjectName(options: EnrichOptions, existingProjectName: string | undefined): string {
  return options.projectName ?? existingProjectName ?? inferProjectName(options.cwd, options.targetDir ?? ".");
}

function resolveLanguage(
  candidate: HarnessLanguage | undefined,
  existingLanguage: HarnessLanguage | undefined,
): HarnessLanguage | undefined {
  return candidate ?? existingLanguage;
}
