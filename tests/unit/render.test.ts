import { describe, expect, it } from "vitest";

import { renderTemplate } from "../../src/render.js";

describe("renderTemplate", () => {
  it("replaces scalar placeholders", () => {
    expect(
      renderTemplate("Hello {{projectName}} from {{preset}}.", {
        projectName: "Example",
        preset: "generic-software",
      }),
    ).toBe("Hello Example from generic-software.");
  });

  it("renders list placeholders as markdown bullets", () => {
    expect(
      renderTemplate("Roles:\n{{#list roles}}", {
        roles: ["architect-backend", "reviewer"],
      }),
    ).toBe("Roles:\n- architect-backend\n- reviewer");
  });

  it("throws when placeholders remain unresolved", () => {
    expect(() => renderTemplate("{{missing}}", {})).toThrow(/missing/i);
  });

  it("throws when a list placeholder receives a scalar", () => {
    expect(() =>
      renderTemplate("{{#list roles}}", {
        roles: "reviewer",
      }),
    ).toThrow(/list placeholder/i);
  });

  it("throws when a scalar placeholder receives a list", () => {
    expect(() =>
      renderTemplate("{{projectName}}", {
        projectName: ["Acme Platform"],
      }),
    ).toThrow(/scalar placeholder/i);
  });
});
