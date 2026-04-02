import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  checkCodexAvailability,
  resolveCodexCommand,
  runCodexExec,
} from "../../src/core/codex-runner.js";
import { createFakeCodexBinary } from "../helpers/fake-codex.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("codex runner", () => {
  it("prefers an explicit codex override before falling back to env or default", () => {
    expect(resolveCodexCommand({ HARNESS_CODEX_BIN: "/env/codex" }, "/custom/codex")).toBe("/custom/codex");
    expect(resolveCodexCommand({ HARNESS_CODEX_BIN: "/env/codex" })).toBe("/env/codex");
    expect(resolveCodexCommand({})).toBe("codex");
  });

  it("reports unavailable codex binaries with guidance", async () => {
    const result = await checkCodexAvailability("/definitely/missing/codex");

    expect(result.available).toBe(false);
    expect(result.command).toBe("/definitely/missing/codex");
    expect(result.suggestedNextStep).toContain("codex login");
  });

  it("runs codex exec, captures the prompt, and reads the last message", async () => {
    await withTempDir(async (dir) => {
      const argsFile = join(dir, "args.json");
      const promptFile = join(dir, "prompt.txt");
      const fakeCodex = await createFakeCodexBinary(dir, {
        argsFile,
        promptFile,
        lastMessage: "Fake codex last message.",
      });

      const result = await runCodexExec({
        cwd: dir,
        command: fakeCodex,
        env: process.env,
        prompt: "Summarize this repository.",
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("fake codex stdout");
      expect(result.lastMessage).toContain("Fake codex last message.");

      const capturedPrompt = await readFile(promptFile, "utf8");
      expect(capturedPrompt).toBe("Summarize this repository.");

      const capturedArgs = JSON.parse(await readFile(argsFile, "utf8")) as string[];
      expect(capturedArgs).toContain("exec");
      expect(capturedArgs).toContain("--skip-git-repo-check");
      expect(capturedArgs).toContain("--full-auto");
      expect(capturedArgs).toContain("-C");
      expect(capturedArgs).toContain(dir);
    });
  });
});
