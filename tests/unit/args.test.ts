import { describe, expect, it } from "vitest";

import { asString, parseArgs, parseHarnessLanguage, parseTaskClass } from "../../src/cli/args.js";

describe("CLI argument helpers", () => {
  it("parses positionals, boolean flags, and inline option values", () => {
    const parsed = parseArgs([
      "demo-task",
      "--class=A",
      "--yes",
      "--project-name",
      "Acme Platform",
    ]);

    expect(parsed.positionals).toEqual(["demo-task"]);
    expect(parsed.options.class).toBe("A");
    expect(parsed.options.yes).toBe(true);
    expect(parsed.options["project-name"]).toBe("Acme Platform");
  });

  it("returns undefined for non-string options", () => {
    expect(asString(true)).toBeUndefined();
  });

  it("validates harness language options", () => {
    expect(parseHarnessLanguage("zh")).toBe("zh");
    expect(() => parseHarnessLanguage("fr")).toThrow(/invalid language/i);
  });

  it("defaults task class to B and rejects unknown values", () => {
    expect(parseTaskClass(undefined)).toBe("B");
    expect(parseTaskClass("C")).toBe("C");
    expect(() => parseTaskClass("Z")).toThrow(/invalid task class/i);
  });
});
