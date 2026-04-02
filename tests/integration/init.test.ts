import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { initProject } from "../../src/init.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("initProject", () => {
  it("scaffolds the repository-owned harness documentation skeleton", async () => {
    await withTempDir(async (dir) => {
      const result = await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      expect(result.createdFiles.length).toBeGreaterThan(10);
      await expect(stat(join(dir, "AGENTS.override.md"))).resolves.toBeDefined();
      await expect(stat(join(dir, "AGENTS.md"))).rejects.toThrow();
      await expect(stat(join(dir, "ARCHITECTURE.md"))).resolves.toBeDefined();
      await expect(stat(join(dir, ".codex", "config.toml"))).resolves.toBeDefined();
      await expect(stat(join(dir, ".codex", "agents", "orchestrator.toml"))).resolves.toBeDefined();
      await expect(stat(join(dir, ".codex", "agents", "planner.toml"))).resolves.toBeDefined();
      await expect(stat(join(dir, ".codex", "agents", "builder.toml"))).resolves.toBeDefined();
      await expect(stat(join(dir, ".codex", "agents", "reviewer.toml"))).resolves.toBeDefined();
      await expect(stat(join(dir, ".codex", "agents", "tester.toml"))).resolves.toBeDefined();
      await expect(stat(join(dir, "docs", "design-docs", "template.md"))).resolves.toBeDefined();
      await expect(stat(join(dir, "docs", "product-specs", "template.md"))).resolves.toBeDefined();
      await expect(stat(join(dir, "docs", "exec-plans", "template.md"))).resolves.toBeDefined();
      await expect(stat(join(dir, "docs", "generated", "db-schema.md"))).resolves.toBeDefined();

      const overrideContent = await readFile(join(dir, "AGENTS.override.md"), "utf8");
      expect(overrideContent).toContain("Codex Collaboration Guide");
      expect(overrideContent).toContain("Orchestrator");
      expect(overrideContent).toContain("Planner");
      expect(overrideContent).toContain("Builder");
      expect(overrideContent).toContain("Reviewer");
      expect(overrideContent).toContain("Tester");
      expect(overrideContent).toContain(".codex/agents/orchestrator.toml");

      const codexConfig = await readFile(join(dir, ".codex", "config.toml"), "utf8");
      expect(codexConfig).toContain("[agents]");
      expect(codexConfig).toContain("max_threads = 6");
      expect(codexConfig).toContain("max_depth = 1");

      const reviewerAgent = await readFile(join(dir, ".codex", "agents", "reviewer.toml"), "utf8");
      expect(reviewerAgent).toContain('name = "reviewer"');
      expect(reviewerAgent).toContain("developer_instructions");

      const packageJson = JSON.parse(
        await readFile(join(dir, "package.json"), "utf8"),
      ) as { devDependencies?: Record<string, string> };
      expect(packageJson.devDependencies?.["harness-engineer"]).toBe("^0.1.0");

      const config = JSON.parse(
        await readFile(join(dir, "harness-engineer.config.json"), "utf8"),
      ) as { projectName: string; preset: string; roles: Array<{ key: string }> };
      expect(config.projectName).toBe("Acme Platform");
      expect(config.preset).toBe("generic-software");
      expect(config.roles.map((role) => role.key)).toEqual([
        "orchestrator",
        "planner",
        "builder",
        "reviewer",
        "tester",
      ]);
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

      const agentsPath = join(dir, "AGENTS.override.md");
      await writeFile(agentsPath, "# Customized\n", "utf8");

      const secondRun = await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
      });

      expect(secondRun.skippedFiles).toContain("AGENTS.override.md");
      expect(await readFile(agentsPath, "utf8")).toBe("# Customized\n");
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
      await writeFile(agentsPath, "# Drifted\n", "utf8");

      const forcedRun = await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
        force: true,
      });

      expect(forcedRun.overwrittenFiles).toContain("AGENTS.override.md");
      expect(await readFile(agentsPath, "utf8")).not.toBe("# Drifted\n");
    });
  });

  it("supports a dry run without writing files", async () => {
    await withTempDir(async (dir) => {
      const result = await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
        dryRun: true,
      });

      expect(result.dryRun).toBe(true);
      expect(result.createdFiles).toContain("AGENTS.override.md");
      await expect(stat(join(dir, "AGENTS.override.md"))).rejects.toThrow();
      await expect(stat(join(dir, "AGENTS.md"))).rejects.toThrow();
      await expect(stat(join(dir, "harness-engineer.config.json"))).rejects.toThrow();
    });
  });

  it("records the preferred collaboration language in generated docs", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
        language: "zh",
      });

      const agentsContent = await readFile(join(dir, "AGENTS.override.md"), "utf8");
      expect(agentsContent).toContain("## 目的");
      expect(agentsContent).toContain("偏好协作语言：`中文`");
    });
  });

  it("renders bilingual documents when requested", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "Acme Platform",
        preset: "generic-software",
        packageVersion: "0.1.0",
        language: "bilingual",
      });

      const agentsContent = await readFile(join(dir, "AGENTS.override.md"), "utf8");
      expect(agentsContent).toContain("<!-- Generated in bilingual mode");
      expect(agentsContent).toContain("## English");
      expect(agentsContent).toContain("## 中文");
      expect(agentsContent).toContain("# Acme Platform Codex Collaboration Guide");
      expect(agentsContent).toContain("# Acme Platform Codex 协作指南");

      const docsIndex = await readFile(join(dir, "docs", "index.md"), "utf8");
      expect(docsIndex).toContain("# Acme Platform Documentation Index");
      expect(docsIndex).toContain("# Acme Platform 文档索引");
    });
  });
});
