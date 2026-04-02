import { describe, expect, it } from "vitest";

import { getPreset } from "../../src/presets.js";

describe("presets", () => {
  it("returns the generic-software preset with the default collaboration roles", () => {
    const preset = getPreset("generic-software");

    expect(preset.roles.map((role) => role.key)).toEqual([
      "orchestrator",
      "planner",
      "builder",
      "reviewer",
      "tester",
    ]);
    expect(preset.templateDirectory).toBe("generic-software");
    expect(preset.paths.codexConfigFile).toBe(".codex/config.toml");
    expect(preset.paths.codexAgentsDir).toBe(".codex/agents");
  });

  it("keeps the generic-software preset free of machine-local paths and external-project identifiers", () => {
    const preset = getPreset("generic-software");
    const serialized = JSON.stringify(preset);

    expect(serialized).not.toContain("/Users/");
    expect(serialized).not.toContain("AgentAdmin");
    expect(serialized).not.toContain("agentadmin-");
    expect(serialized).not.toContain("docs/source-of-truth");
  });

  it("throws for unknown presets", () => {
    expect(() => getPreset("does-not-exist")).toThrow(/unknown preset/i);
  });
});
