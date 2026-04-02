import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { initProject } from "../../src/init.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("initProject", () => {
  it("scaffolds the generic Codex harness into an empty repository", async () => {
    await withTempDir(async (dir) => {
      const result = await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      expect(result.createdFiles.length).toBeGreaterThan(10);
      await expect(stat(join(dir, "AGENTS.override.md"))).resolves.toBeDefined();
      await expect(stat(join(dir, ".codex", "agents"))).resolves.toBeDefined();
      await expect(stat(join(dir, "docs", "design-docs"))).resolves.toBeDefined();
      await expect(stat(join(dir, "docs", "product-specs"))).resolves.toBeDefined();
      await expect(stat(join(dir, "docs", "exec-plans"))).resolves.toBeDefined();

      const config = JSON.parse(
        await readFile(join(dir, "harness-engineer.config.json"), "utf8"),
      ) as { projectName: string; preset: string };

      expect(config.projectName).toBe("Acme Platform");
      expect(config.preset).toBe("generic-software");
    });
  });

  it("does not overwrite managed files on a second init without --force", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      const secondRun = await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      expect(secondRun.skippedFiles).toContain("AGENTS.override.md");
      expect(secondRun.overwrittenFiles).toEqual([]);
    });
  });

  it("overwrites managed files when force is enabled", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      const agentsPath = join(dir, "AGENTS.override.md");
      await readFile(agentsPath, "utf8");

      const forcedRun = await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
        force: true,
      });

      expect(forcedRun.overwrittenFiles).toContain("AGENTS.override.md");
    });
  });

  it("creates an optional Codex environment file only when a dev command is provided", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
        devCommand: "pnpm dev",
      });

      const files = await readdir(join(dir, ".codex", "environments"));
      expect(files).toContain("environment.toml");
    });
  });

  it("keeps the generic preset free of external-project identifiers, legacy layout names, and absolute paths", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      const agentsContent = await readFile(join(dir, ".codex", "agents", "README.md"), "utf8");
      const indexContent = await readFile(join(dir, "docs", "index.md"), "utf8");
      const bootstrapContent = await readFile(
        join(dir, "docs", "runbooks", "main-thread-bootstrap.md"),
        "utf8",
      );

      const combined = `${agentsContent}\n${indexContent}\n${bootstrapContent}`;
      expect(combined).not.toContain("AgentAdmin");
      expect(combined).not.toContain("agentadmin-");
      expect(combined).not.toContain("dev-docs/");
      expect(combined).not.toContain("docs/source-of-truth");
      expect(combined).not.toContain("docs/plans/");
      expect(combined).not.toContain("/Users/");
    });
  });

  it("generates a bilingual Codex override when bilingual mode is selected", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
        language: "bilingual",
      });

      const overrideContent = await readFile(join(dir, "AGENTS.override.md"), "utf8");
      const indexContent = await readFile(join(dir, "docs", "index.md"), "utf8");
      const bootstrapContent = await readFile(
        join(dir, "docs", "runbooks", "main-thread-bootstrap.md"),
        "utf8",
      );

      expect(overrideContent).toContain("## 中文");
      expect(overrideContent).toContain("## English");
      expect(indexContent).toContain("## 中文");
      expect(bootstrapContent).toContain("## English");
      await expect(stat(join(dir, "AGENTS.md"))).rejects.toThrow();

      const config = JSON.parse(
        await readFile(join(dir, "harness-engineer.config.json"), "utf8"),
      ) as { language: string };

      expect(config.language).toBe("bilingual");
    });
  });
});
