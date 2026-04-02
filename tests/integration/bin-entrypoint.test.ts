import { chmod, mkdtemp, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { withTempDir } from "../helpers/temp-dir.js";

describe("CLI bin entrypoint", () => {
  it("runs correctly when invoked through a symlinked path", async () => {
    await withTempDir(async () => {
      const linkDir = await mkdtemp(join(tmpdir(), "harness-bin-link-"));
      const linkedPath = join(linkDir, "harness.mjs");

      await chmod(join(process.cwd(), "dist", "cli.js"), 0o755).catch(() => {});
      await symlink(join(process.cwd(), "dist", "cli.js"), linkedPath);

      const { spawnSync } = await import("node:child_process");
      const result = spawnSync(process.execPath, [linkedPath, "--version"], {
        cwd: process.cwd(),
        encoding: "utf8",
      });

      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBeTruthy();
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
