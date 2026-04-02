import { describe, expect, it } from "vitest";

import { runCli } from "../../src/cli.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("CLI smoke flow", () => {
  it("prints help successfully", async () => {
    await withTempDir(async (dir) => {
      await expect(runCli(["help"], dir)).resolves.toBe(0);
    });
  });

  it("runs init followed by task new in a fresh directory", async () => {
    await withTempDir(async (dir) => {
      const initExitCode = await runCli(
        ["init", ".", "--preset", "generic-software", "--project-name", "Acme Platform", "--yes"],
        dir,
      );
      const taskExitCode = await runCli(
        ["task", "new", "demo-task", "--class", "B"],
        dir,
      );

      expect(initExitCode).toBe(0);
      expect(taskExitCode).toBe(0);
    });
  });

  it("surfaces argument validation errors for invalid task classes", async () => {
    await withTempDir(async (dir) => {
      await runCli(
        ["init", ".", "--preset", "generic-software", "--project-name", "Acme Platform", "--yes"],
        dir,
      );

      await expect(
        runCli(["task", "new", "demo-task", "--class", "Z"], dir),
      ).rejects.toThrow(/invalid task class/i);
    });
  });

  it("supports status after initialization", async () => {
    await withTempDir(async (dir) => {
      await runCli(
        ["init", ".", "--preset", "generic-software", "--project-name", "Acme Platform", "--yes"],
        dir,
      );

      await expect(runCli(["status"], dir)).resolves.toBe(0);
    });
  });

  it("accepts bilingual language selection during initialization", async () => {
    await withTempDir(async (dir) => {
      await expect(
        runCli(
          [
            "init",
            ".",
            "--preset",
            "generic-software",
            "--project-name",
            "Acme Platform",
            "--language",
            "bilingual",
            "--yes",
          ],
          dir,
        ),
      ).resolves.toBe(0);
    });
  });
});
