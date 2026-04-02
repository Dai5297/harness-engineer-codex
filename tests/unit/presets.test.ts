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

  it("keeps the generic-software preset free of machine-local paths and external-project identifiers", () => {
    const preset = getPreset("generic-software");
    const serialized = JSON.stringify(preset);

    expect(serialized).not.toContain("/Users/");
    expect(serialized).not.toContain("AgentAdmin");
    expect(serialized).not.toContain("agentadmin-");
    expect(serialized).not.toContain("dev-docs/");
    expect(serialized).not.toContain("\"spec/");
  });

  it("throws for unknown presets", () => {
    expect(() => getPreset("does-not-exist")).toThrow(/unknown preset/i);
  });
});
