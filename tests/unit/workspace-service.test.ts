import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { inspectTargetDirectory } from "../../src/core/workspace-service.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("workspace inspection", () => {
  it("treats a missing directory as empty and safe", async () => {
    await withTempDir(async (dir) => {
      const inspection = await inspectTargetDirectory(dir, "fresh-project");

      expect(inspection.exists).toBe(false);
      expect(inspection.isEmpty).toBe(true);
      expect(inspection.needsConfirmation).toBe(false);
    });
  });

  it("detects non-empty directories", async () => {
    await withTempDir(async (dir) => {
      const target = join(dir, "existing-project");
      await mkdir(target);
      await writeFile(join(target, "README.md"), "# Existing\n", "utf8");

      const inspection = await inspectTargetDirectory(dir, "existing-project");

      expect(inspection.exists).toBe(true);
      expect(inspection.isEmpty).toBe(false);
      expect(inspection.needsConfirmation).toBe(true);
      expect(inspection.entries).toEqual(["README.md"]);
    });
  });

  it("rejects file paths that are not directories", async () => {
    await withTempDir(async (dir) => {
      await writeFile(join(dir, "not-a-directory"), "hello", "utf8");

      await expect(inspectTargetDirectory(dir, "not-a-directory")).rejects.toThrow(/not a directory/i);
    });
  });
});
