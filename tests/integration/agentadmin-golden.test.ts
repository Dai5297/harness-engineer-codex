import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { initProject } from "../../src/init.js";
import { agentAdminCodexFixture } from "../fixtures/agentadmin-codex.fixture.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("agentadmin-codex preset", () => {
  it("preserves the current AgentAdmin harness core semantics", async () => {
    await withTempDir(async (dir) => {
      await initProject({
        cwd: dir,
        projectName: "AgentAdmin",
        preset: "agentadmin-codex",
        packageVersion: "0.1.0",
      });

      const generatedAgents = await readFile(join(dir, "AGENTS.md"), "utf8");
      const generatedIndex = await readFile(join(dir, "docs", "index.md"), "utf8");
      const generatedBootstrap = await readFile(
        join(dir, "docs", "runbooks", "main-thread-bootstrap.md"),
        "utf8",
      );

      expect(extractFixedRoles(generatedAgents)).toEqual(agentAdminCodexFixture.fixedRoles);
      expect(extractHarnessPaths(generatedIndex)).toEqual(
        expect.arrayContaining(agentAdminCodexFixture.indexRequiredPaths),
      );
      expect(extractFixedRoles(generatedBootstrap)).toEqual(agentAdminCodexFixture.fixedRoles);
      expect(generatedBootstrap).not.toContain("/Users/");
      for (const snippet of agentAdminCodexFixture.bootstrapRequiredSnippets) {
        expect(generatedBootstrap).toContain(snippet);
      }

      for (const [agentFile, requiredSnippets] of Object.entries(agentAdminCodexFixture.roleFileSnippets)) {
        const generated = await readFile(join(dir, ".codex", "agents", agentFile), "utf8");
        expect(generated).not.toContain("/Users/");
        for (const snippet of requiredSnippets) {
          expect(normalizeToml(generated)).toContain(snippet);
        }
      }
    });
  });
});

function extractFixedRoles(text: string): string[] {
  const roles = text.match(/`(architect-backend|architect-frontend|runtime-executor|console-ui|reviewer|qa-guard)`/g) ?? [];
  return [...new Set(roles.map((role) => role.slice(1, -1)))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function extractHarnessPaths(text: string): string[] {
  const tokens = text.match(/`([^`]+)`/g) ?? [];
  return tokens
    .map((token) => token.slice(1, -1))
    .filter((token) =>
      [
        "../.codex/config.toml",
        "../.codex/agents/README.md",
        "../.codex/memory/registry.md",
        "./runbooks/",
        "./plans/active/",
        "./plans/completed/",
        "../logs/codex/active/",
        "../logs/codex/completed/",
        "../dev-docs/",
        "../spec/",
      ].includes(token),
    )
    .sort((left, right) => left.localeCompare(right));
}

function normalizeToml(text: string): string {
  return text
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "");
}
