import type { InitOptions, InitResult } from "../types/harness.js";
import { scaffoldProject } from "./scaffold-service.js";

export async function initProject(options: InitOptions): Promise<InitResult> {
  const result = await scaffoldProject({
    cwd: options.cwd,
    targetDir: options.targetDir,
    projectName: options.projectName,
    preset: options.preset,
    language: options.language,
    packageVersion: options.packageVersion,
    dryRun: options.dryRun,
    includePackageJson: true,
    managedWriteMode: options.force ? "force-managed" : "create-missing",
    alwaysWritePaths: new Set(["package.json"]),
  });

  return {
    targetDir: result.targetDir,
    createdFiles: result.createdFiles,
    skippedFiles: result.skippedFiles,
    overwrittenFiles: result.overwrittenFiles,
    dryRun: result.dryRun,
  };
}
