import { describe, expect, it } from "vitest";

import {
  buildHarnessDependencyVersion,
  buildHarnessConfig,
  createDefaultPackageJson,
  readOwnPackageVersion,
} from "../../src/config.js";

describe("config helpers", () => {
  it("builds a default package manifest for a new repository", () => {
    expect(createDefaultPackageJson("Acme Platform")).toEqual({
      name: "acme-platform",
      version: "0.0.0",
      private: true,
      devDependencies: {},
    });
  });

  it("uses caret ranges for concrete harness versions and latest otherwise", () => {
    expect(buildHarnessDependencyVersion("0.1.0")).toBe("^0.1.0");
    expect(buildHarnessDependencyVersion("latest")).toBe("latest");
  });

  it("falls back to latest when the package version cannot be discovered", async () => {
    await expect(readOwnPackageVersion("file:///missing/cli.js")).resolves.toBe("latest");
  });

  it("builds a harness config with managed files from the selected preset", () => {
    const config = buildHarnessConfig({
      cwd: "/tmp/project",
      projectName: "Acme Platform",
      presetKey: "generic-software",
      language: "zh",
    });

    expect(config.projectName).toBe("Acme Platform");
    expect(config.language).toBe("zh");
    expect(config.managedFiles).toContain("AGENTS.override.md");
    expect(config.managedFiles).not.toContain("AGENTS.md");
    expect(config.managedFiles).toContain("ARCHITECTURE.md");
    expect(config.managedFiles).toContain(".codex/config.toml");
    expect(config.managedFiles).toContain(".codex/agents/reviewer.toml");
    expect(config.managedFiles).toContain("docs/exec-plans/template.md");
    expect(config.managedFiles).toContain("docs/product-specs/template.md");
  });
});
