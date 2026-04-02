import type { HarnessConfig } from "../types/harness.js";

const ENRICHABLE_DOC_PATHS = [
  "AGENTS.override.md",
  "ARCHITECTURE.md",
  "docs/index.md",
  "docs/DESIGN.md",
  "docs/FRONTEND.md",
  "docs/PLANS.md",
  "docs/PRODUCT_SENSE.md",
  "docs/QUALITY_SCORE.md",
  "docs/RELIABILITY.md",
  "docs/SECURITY.md",
  "docs/design-docs/index.md",
  "docs/product-specs/index.md",
  "docs/references/index.md",
] as const;

export function buildCodexEnrichPrompt(config: HarnessConfig): string {
  return [
    `You are enriching the repository-owned harness documentation for "${config.projectName}".`,
    `Preferred collaboration language: ${config.language}.`,
    "",
    "Goal:",
    "- Read the repository and update the harness docs so future agents can recover project context from files instead of chat history.",
    "",
    "Write scope:",
    ...ENRICHABLE_DOC_PATHS.map((path) => `- You may create or update \`${path}\`.`),
    "- Do not rewrite `docs/design-docs/template.md`, `docs/product-specs/template.md`, or `docs/exec-plans/template.md` into project-specific content.",
    "",
    "Hard constraints:",
    "- Do not modify application code, tests, dependencies, lockfiles, CI, or build configuration.",
    "- Base every statement on repository evidence. If something is unclear, mark it as an explicit open question or assumption.",
    "- Keep guidance concrete and useful for future Codex sessions.",
    "- Preserve any high-signal existing content instead of replacing it with generic boilerplate.",
    "",
    "Required outcomes:",
    "- `AGENTS.override.md` should explain document lookup order, role boundaries, and how the repo should be used with Codex.",
    "- `ARCHITECTURE.md` should summarize the real module boundaries, runtime shape, and important technical constraints.",
    "- `docs/index.md` should route readers to the right source-of-truth files.",
    "- The topical docs should capture repo-specific product, design, quality, reliability, and security context where evidence exists.",
    "",
    "Process:",
    "- Inspect the codebase, package manifests, config files, and existing docs before editing.",
    "- Prefer concise, factual writing over placeholders.",
    "- Leave template files intact for future task-specific docs.",
  ].join("\n");
}
