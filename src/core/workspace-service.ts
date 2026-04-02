import { resolve } from "node:path";

import { isDirectory, listDirectoryEntries, pathExists } from "../utils/fs.js";

export interface DirectoryInspection {
  targetDir: string;
  exists: boolean;
  isEmpty: boolean;
  entries: string[];
  needsConfirmation: boolean;
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
    };
  }

  if (!(await isDirectory(absoluteTargetDir))) {
    throw new Error(`Target path "${targetDir}" exists and is not a directory.`);
  }

  const entries = await listDirectoryEntries(absoluteTargetDir);

  return {
    targetDir: absoluteTargetDir,
    exists: true,
    isEmpty: entries.length === 0,
    entries,
    needsConfirmation: entries.length > 0,
  };
}
