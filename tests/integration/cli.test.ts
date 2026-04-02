import { stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runCli } from "../../src/cli.js";
import { createTestIo } from "../helpers/io.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("CLI smoke flow", () => {
  it("prints help successfully", async () => {
    await withTempDir(async (dir) => {
      const { io, output } = createTestIo();

      await expect(runCli(["help"], dir, io)).resolves.toBe(0);
      expect(output.join("\n")).toContain("harness-engineer init");
    });
  });

  it("runs init followed by task new in a fresh directory", async () => {
    await withTempDir(async (dir) => {
      const { io } = createTestIo();

      const initExitCode = await runCli(["init", ".", "--project-name", "Acme Platform", "--yes"], dir, io);
      const taskExitCode = await runCli(["task", "new", "demo-task", "--class", "B"], dir, io);

      expect(initExitCode).toBe(0);
      expect(taskExitCode).toBe(0);
      await expect(stat(join(dir, "docs", "exec-plans", "active", "demo-task.md"))).resolves.toBeDefined();
    });
  });

  it("surfaces argument validation errors for invalid task classes", async () => {
    await withTempDir(async (dir) => {
      const { io } = createTestIo();

      await runCli(["init", ".", "--project-name", "Acme Platform", "--yes"], dir, io);

      await expect(
        runCli(["task", "new", "demo-task", "--class", "Z"], dir, io),
      ).rejects.toThrow(/invalid task class/i);
    });
  });

  it("supports status after initialization", async () => {
    await withTempDir(async (dir) => {
      const { io, output } = createTestIo();

      await runCli(["init", ".", "--project-name", "Acme Platform", "--yes"], dir, io);
      await expect(runCli(["status"], dir, io)).resolves.toBe(0);
      expect(output.join("\n")).toContain("Managed files");
    });
  });

  it("refuses to initialize a non-empty directory without confirmation in non-interactive mode", async () => {
    await withTempDir(async (dir) => {
      await writeFile(join(dir, "README.md"), "# Existing\n", "utf8");
      const { io } = createTestIo({ interactive: false });

      await expect(
        runCli(["init", ".", "--project-name", "Acme Platform"], dir, io),
      ).rejects.toThrow(/non-empty/i);
    });
  });

  it("allows initialization in a non-empty directory when --yes is provided", async () => {
    await withTempDir(async (dir) => {
      await writeFile(join(dir, "README.md"), "# Existing\n", "utf8");
      const { io } = createTestIo({ interactive: false });

      await expect(
        runCli(["init", ".", "--project-name", "Acme Platform", "--yes"], dir, io),
      ).resolves.toBe(0);
      await expect(stat(join(dir, "AGENTS.override.md"))).resolves.toBeDefined();
    });
  });

  it("supports dry-run mode for init", async () => {
    await withTempDir(async (dir) => {
      const { io, output } = createTestIo();

      await expect(
        runCli(["init", ".", "--project-name", "Acme Platform", "--dry-run", "--yes"], dir, io),
      ).resolves.toBe(0);

      expect(output.join("\n")).toContain("Dry run");
      await expect(stat(join(dir, "AGENTS.override.md"))).rejects.toThrow();
    });
  });
});
