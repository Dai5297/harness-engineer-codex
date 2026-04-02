import { describe, expect, it } from "vitest";

import { getPreset } from "../../src/presets.js";

describe("presets", () => {
  it("returns the generic-software preset with six fixed roles", () => {
    const preset = getPreset("generic-software");

    expect(preset.roles.map((role) => role.key)).toEqual([
      "architect-backend",
      "architect-frontend",
      "runtime-integrations",
      "product-ui",
      "reviewer",
      "qa-guard",
    ]);
  });

  it("keeps the agentadmin-codex preset free of machine-local absolute paths", () => {
    const preset = getPreset("agentadmin-codex");
    const serialized = JSON.stringify(preset);

    expect(serialized).not.toContain("/Users/");
    expect(serialized).toContain("AgentAdmin");
  });

  it("throws for unknown presets", () => {
    expect(() => getPreset("does-not-exist")).toThrow(/unknown preset/i);
  });
});
