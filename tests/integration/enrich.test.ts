import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runCli } from "../../src/cli.js";
import { createTestIo } from "../helpers/io.js";
import { createFakeCodexBinary } from "../helpers/fake-codex.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe.sequential("enrich flow", () => {
  it("refuses to enrich an empty directory", async () => {
    await withTempDir(async (dir) => {
      const { io } = createTestIo({ interactive: false });

      await expect(runCli(["enrich", "."], dir, io)).rejects.toThrow(/looks empty/i);
    });
  });

  it("scaffolds missing docs and runs Codex for an existing project", async () => {
    await withTempDir(async (dir) => {
      await writeFile(join(dir, "package.json"), '{ "name": "existing-project" }\n', "utf8");
      await writeFile(join(dir, "README.md"), "# Existing Project\n", "utf8");
      await writeFile(join(dir, "tsconfig.json"), '{ "compilerOptions": {} }\n', "utf8");

      const argsFile = join(dir, "codex-args.json");
      const promptFile = join(dir, "codex-prompt.txt");
      const codexBinary = await createFakeCodexBinary(dir, {
        argsFile,
        promptFile,
        architectureContent: "# Repository Architecture\n\nGenerated from fake codex.",
        lastMessage: "Enrichment completed by fake codex.",
      });

      const previous = process.env.HARNESS_CODEX_BIN;
      process.env.HARNESS_CODEX_BIN = codexBinary;

      try {
        const { io, output } = createTestIo({ interactive: false });
        const exitCode = await runCli(["enrich", ".", "--project-name", "Acme Platform", "--yes"], dir, io);

        expect(exitCode).toBe(0);
        expect(output.join("\n")).toContain("Enriched");
        expect(output.join("\n")).toContain("Workspace: existing");
        expect(output.join("\n")).toContain("Codex: completed with exit code 0");

        await expect(stat(join(dir, "AGENTS.override.md"))).resolves.toBeDefined();
        await expect(stat(join(dir, "harness-engineer.config.json"))).resolves.toBeDefined();

        const architecture = await readFile(join(dir, "ARCHITECTURE.md"), "utf8");
        expect(architecture).toContain("Generated from fake codex");

        const prompt = await readFile(promptFile, "utf8");
        expect(prompt).toContain('You are enriching the harness runtime for "Acme Platform"');
        expect(prompt).toContain("DO NOT modify application code");

        const args = JSON.parse(await readFile(argsFile, "utf8")) as string[];
        expect(args).toContain("exec");
        expect(args).toContain("--skip-git-repo-check");
        expect(args).toContain("--full-auto");
      } finally {
        if (previous === undefined) {
          delete process.env.HARNESS_CODEX_BIN;
        } else {
          process.env.HARNESS_CODEX_BIN = previous;
        }
      }
    });
  });
});
