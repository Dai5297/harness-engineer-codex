import { join } from "node:path";

import type { StatusResult } from "../types/harness.js";
import { HARNESS_CONFIG_FILE, loadHarnessConfig } from "./config-service.js";
import { getPreset } from "./preset-registry.js";
import { loadManagedTemplateFiles } from "./template-loader.js";
import { findMissingTaskSections } from "./task-service.js";
import { fileContentEquals, listMarkdownSlugs, pathExists, readTextFile } from "../utils/fs.js";

export async function getStatus(cwd: string): Promise<StatusResult> {
  const config = await loadHarnessConfig(cwd);
  const preset = getPreset(config.preset);
  const expectedFiles = await loadManagedTemplateFiles(preset, config);
  const missingManagedFiles: string[] = [];
  const driftedManagedFiles: string[] = [];

  for (const file of expectedFiles) {
    const filePath = join(cwd, file.path);

    if (!(await pathExists(filePath))) {
      missingManagedFiles.push(file.path);
      continue;
    }

    if (!(await fileContentEquals(filePath, file.content))) {
      driftedManagedFiles.push(file.path);
    }
  }

  const activeTasks = await listMarkdownSlugs(join(cwd, config.paths.plansActiveDir));
  const inconsistentTasks: StatusResult["inconsistentTasks"] = [];

  for (const slug of activeTasks) {
    const planPath = join(cwd, config.paths.plansActiveDir, `${slug}.md`);
    const planContents = await readTextFile(planPath);
    const missing = findMissingTaskSections(planContents);

    if (missing.length > 0) {
      inconsistentTasks.push({ slug, missing });
    }
  }

  return {
    configPath: HARNESS_CONFIG_FILE,
    activeTasks,
    missingManagedFiles,
    driftedManagedFiles,
    inconsistentTasks,
  };
}
