import { join } from "node:path";

import type { GeneratedFile, ManagedWriteMode } from "../types/harness.js";
import { pathExists, writeTextFile } from "../utils/fs.js";

export async function writeGeneratedFiles(
  targetDir: string,
  files: GeneratedFile[],
  options: {
    mode: ManagedWriteMode;
    dryRun: boolean;
    alwaysWritePaths?: ReadonlySet<string>;
  },
): Promise<{
  createdFiles: string[];
  skippedFiles: string[];
  overwrittenFiles: string[];
}> {
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];
  const overwrittenFiles: string[] = [];

  for (const file of files) {
    const filePath = join(targetDir, file.path);
    const exists = await pathExists(filePath);
    const shouldAlwaysWrite = options.alwaysWritePaths?.has(file.path) ?? false;

    if (exists && options.mode === "create-missing" && !shouldAlwaysWrite) {
      skippedFiles.push(file.path);
      continue;
    }

    if (!options.dryRun) {
      await writeTextFile(filePath, file.content);
    }

    if (exists) {
      overwrittenFiles.push(file.path);
      continue;
    }

    createdFiles.push(file.path);
  }

  return {
    createdFiles,
    skippedFiles,
    overwrittenFiles,
  };
}
