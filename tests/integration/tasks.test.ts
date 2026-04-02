import { readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { initProject } from "../../src/init.js";
import { getStatus } from "../../src/status.js";
import { archiveTask, createTask } from "../../src/tasks.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("task lifecycle", () => {
  it("creates active plan, run, and handoff files for a new task", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      await createTask({
        cwd: dir,
        slug: "demo-task",
        taskClass: "B",
      });

      await expect(stat(join(dir, "docs", "exec-plans", "active", "demo-task.md"))).resolves.toBeDefined();
      await expect(stat(join(dir, "logs", "codex", "active", "demo-task", "run.md"))).resolves.toBeDefined();
      await expect(stat(join(dir, "logs", "codex", "active", "demo-task", "handoff.md"))).resolves.toBeDefined();
    });
  });

  it("rejects duplicate active task creation", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      await createTask({
        cwd: dir,
        slug: "demo-task",
        taskClass: "B",
      });

      await expect(
        createTask({
          cwd: dir,
          slug: "demo-task",
          taskClass: "B",
        }),
      ).rejects.toThrow(/already exists/i);
    });
  });

  it("archives a task and appends completion sections to the plan", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      await createTask({
        cwd: dir,
        slug: "demo-task",
        taskClass: "B",
      });
      await archiveTask({
        cwd: dir,
        slug: "demo-task",
      });

      const archivedPlan = await readFile(
        join(dir, "docs", "exec-plans", "completed", "demo-task.md"),
        "utf8",
      );

      expect(archivedPlan).toContain("## Result");
      expect(archivedPlan).toContain("## Residual Risks");
      await expect(
        stat(join(dir, "logs", "codex", "completed", "demo-task", "handoff.md")),
      ).resolves.toBeDefined();
    });
  });

  it("reports active tasks and missing artifacts in status output", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      await createTask({
        cwd: dir,
        slug: "demo-task",
        taskClass: "B",
      });

      const status = await getStatus(dir);

      expect(status.activeTasks).toEqual(["demo-task"]);
      expect(status.inconsistentTasks).toEqual([]);
      expect(status.missingManagedFiles).toEqual([]);
    });
  });

  it("detects managed file drift and missing managed files in status output", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      await writeFile(join(dir, "AGENTS.override.md"), "# Drifted\n", "utf8");
      await rm(join(dir, "docs", "runbooks", "qa-agent.md"));

      const status = await getStatus(dir);

      expect(status.driftedManagedFiles).toContain("AGENTS.override.md");
      expect(status.missingManagedFiles).toContain("docs/runbooks/qa-agent.md");
    });
  });

  it("flags inconsistent active tasks when log artifacts are missing", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      await createTask({
        cwd: dir,
        slug: "demo-task",
        taskClass: "B",
      });
      await rm(join(dir, "logs", "codex", "active", "demo-task", "handoff.md"));

      const status = await getStatus(dir);

      expect(status.inconsistentTasks).toEqual([
        {
          slug: "demo-task",
          missing: ["logs/codex/active/demo-task/handoff.md"],
        },
      ]);
    });
  });

  it("rejects archiving a task that does not exist", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      await expect(
        archiveTask({
          cwd: dir,
          slug: "missing-task",
        }),
      ).rejects.toThrow(/does not exist in active plans/i);
    });
  });
});
