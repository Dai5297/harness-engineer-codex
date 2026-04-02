import { join } from "node:path";

import { HARNESS_CONFIG_FILE, loadHarnessConfig } from "./config.js";
import { getPreset } from "./presets.js";
import type { StatusResult } from "./types.js";
import { fileContentEquals, listDirectories, listMarkdownSlugs, pathExists } from "./utils.js";

export async function getStatus(cwd: string): Promise<StatusResult> {
  const config = await loadHarnessConfig(cwd);
  const preset = getPreset(config.preset);
  const expectedFiles = preset.buildManagedFiles(config);
  const missingManagedFiles: string[] = [];
  const driftedManagedFiles: string[] = [];

  for (const entry of expectedFiles) {
    const filePath = join(cwd, entry.path);
    if (!(await pathExists(filePath))) {
      missingManagedFiles.push(entry.path);
      continue;
    }
    if (!(await fileContentEquals(filePath, entry.content))) {
      driftedManagedFiles.push(entry.path);
    }
  }

  const activeTasks = await listMarkdownSlugs(join(cwd, config.paths.plansActiveDir));
  const activeLogDirs = await listDirectories(join(cwd, config.paths.logsActiveDir));
  const allTaskSlugs = [...new Set([...activeTasks, ...activeLogDirs])].sort((left, right) =>
    left.localeCompare(right),
  );

  const inconsistentTasks: StatusResult["inconsistentTasks"] = [];
  for (const slug of allTaskSlugs) {
    const missing: string[] = [];
    if (!activeTasks.includes(slug)) {
      missing.push(join(config.paths.plansActiveDir, `${slug}.md`).replaceAll("\\", "/"));
    }
    const runPath = join(cwd, config.paths.logsActiveDir, slug, "run.md");
    const handoffPath = join(cwd, config.paths.logsActiveDir, slug, "handoff.md");
    if (!(await pathExists(runPath))) {
      missing.push(join(config.paths.logsActiveDir, slug, "run.md").replaceAll("\\", "/"));
    }
    if (!(await pathExists(handoffPath))) {
      missing.push(join(config.paths.logsActiveDir, slug, "handoff.md").replaceAll("\\", "/"));
    }
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
