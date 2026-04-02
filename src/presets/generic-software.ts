import type { HarnessConfig, HarnessPathsConfig, HarnessRoleConfig, PresetDefinition } from "../types/harness.js";

const genericPaths: HarnessPathsConfig = {
  docsRoot: "docs",
  designDocsDir: "docs/design-docs",
  productSpecsDir: "docs/product-specs",
  generatedDocsDir: "docs/generated",
  referencesDir: "docs/references",
  execPlansDir: "docs/exec-plans",
  plansActiveDir: "docs/exec-plans/active",
  plansCompletedDir: "docs/exec-plans/completed",
  execPlanTemplateFile: "docs/exec-plans/template.md",
  codexDir: ".codex",
  codexAgentsDir: ".codex/agents",
  codexConfigFile: ".codex/config.toml",
};

const genericRoles: HarnessRoleConfig[] = [
  {
    key: "orchestrator",
    name: "Orchestrator",
    purpose: "Own task framing, document lookup order, delegation boundaries, and closure criteria.",
    owns: [
      "Task intake, scope framing, and decision logging",
      "Choosing which documents and plans need updates",
      "Handing work across Planner, Builder, Reviewer, and Tester",
    ],
    outputs: [
      "Clear task statement with guardrails",
      "Document update checklist",
      "Decision summary and next-step owner",
    ],
  },
  {
    key: "planner",
    name: "Planner",
    purpose: "Turn goals into phased execution plans, identify dependencies, and surface hidden risk early.",
    owns: [
      "Breaking large work into incremental steps",
      "Finding cross-document and cross-module dependencies",
      "Defining validation and rollout sequencing",
    ],
    outputs: [
      "Execution plan with milestones",
      "Risk register and open questions",
      "Recommended document updates before coding starts",
    ],
  },
  {
    key: "builder",
    name: "Builder",
    purpose: "Implement the smallest correct change, keep documents in sync, and avoid speculative rewrites.",
    owns: [
      "Code changes and low-risk refactors",
      "Updating architecture or product docs when behavior changes",
      "Capturing assumptions that the next role must verify",
    ],
    outputs: [
      "Implementation summary",
      "Changed files and affected boundaries",
      "Notes for Reviewer and Tester",
    ],
  },
  {
    key: "reviewer",
    name: "Reviewer",
    purpose: "Look for regressions, document drift, risky assumptions, and correctness gaps before work is called done.",
    owns: [
      "Findings-first review of behavioral risk",
      "Checking whether docs still match the implementation",
      "Surfacing residual risk and unverified paths",
    ],
    outputs: [
      "Prioritized findings",
      "Drift or omission callouts",
      "Residual risk summary",
    ],
  },
  {
    key: "tester",
    name: "Tester",
    purpose: "Define and execute the validation matrix, then report exactly what is verified and what is still unknown.",
    owns: [
      "Unit, integration, and workflow validation planning",
      "Evidence capture for manual and automated checks",
      "Clear verified versus unverified reporting",
    ],
    outputs: [
      "Validation matrix",
      "Executed checks with results",
      "Outstanding test gaps and release blockers",
    ],
  },
];

function buildRoleSummary(role: HarnessRoleConfig): string {
  return `\`${role.name}\` is responsible for ${uncapitalize(role.purpose)}`;
}

function buildRoleOwnership(role: HarnessRoleConfig): string {
  return `\`${role.name}\`: ${role.owns.join("; ")}`;
}

function buildRoleOutput(role: HarnessRoleConfig): string {
  return `\`${role.name}\`: ${role.outputs.join("; ")}`;
}

function uncapitalize(value: string): string {
  return value.length === 0 ? value : `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function buildTemplateContext(config: HarnessConfig) {
  return {
    projectName: config.projectName,
    language: config.language,
    roleSummaries: config.roles.map(buildRoleSummary),
    roleOwnership: config.roles.map(buildRoleOwnership),
    roleOutputs: config.roles.map(buildRoleOutput),
    subagentPaths: config.roles.map((role) => `\`.codex/agents/${role.key}.toml\``),
    subagentUsage: [
      "Project-scoped custom agents live under `.codex/agents/` and are meant for explicit subagent delegation.",
      "Use `.codex/config.toml` to keep `[agents]` runtime settings like `max_threads` and `max_depth` with the repo.",
      "Keep each custom agent narrow, opinionated, and aligned to one main responsibility.",
      "Prefer read-only agents for planning and review; use write-capable agents only when implementation is the goal.",
    ],
    collaborationSequence: [
      "Read `AGENTS.override.md`, `ARCHITECTURE.md`, and `docs/index.md` before planning implementation details.",
      "Use `docs/exec-plans/active/` for any task that spans multiple decisions, roles, or review rounds.",
      "Update repository-owned documents in the same change whenever contracts, behavior, or constraints move.",
      "Keep Reviewer and Tester independent from Builder when validating risky changes.",
      "Record what is verified, what is assumed, and what still needs follow-up before closing work.",
    ],
    documentationAreas: [
      "`AGENTS.override.md` for collaboration rules, role boundaries, and document lookup order.",
      "`ARCHITECTURE.md` for the system map, major modules, and boundary rules.",
      "`docs/design-docs/` for technical rationale, decision records, and cross-cutting design tradeoffs.",
      "`docs/product-specs/` for user-facing behavior, flows, and acceptance criteria.",
      "`docs/exec-plans/` for active and completed multi-step work.",
      "`docs/generated/` for local artifacts that agents should reference instead of re-deriving.",
      "`docs/references/` for durable external knowledge, glossary items, and important links.",
    ],
    architectureBoundaries: [
      "`Application` layer for orchestration, workflows, and policy-aware use cases.",
      "`Domain` layer for business rules, vocabulary, and invariants that should stay stable.",
      "`Infrastructure` layer for storage, network, CLI, vendor SDKs, and automation plumbing.",
      "`Repository documents` for durable decisions, quality bars, and agent-readable project context.",
    ],
    qualitySignals: [
      "Clarity: can a new contributor find the right source-of-truth document quickly?",
      "Correctness: does the implementation still match product specs and architecture constraints?",
      "Change safety: did the plan, validation, and review evidence cover the risky paths?",
      "Operational quality: are reliability and security expectations documented and testable?",
    ],
    reliabilityChecklist: [
      "Name the critical path, expected latency budget, and failure mode for every user-facing workflow.",
      "Log enough structured context to debug production failures without replaying the whole session.",
      "Prefer safe degradation over hidden failure when external services or automation steps break.",
      "Write runbooks for workflows that are easy to misoperate or expensive to recover.",
    ],
    securityChecklist: [
      "Validate every untrusted input at the boundary where it first enters the system.",
      "Treat secrets, tokens, and credentials as runtime configuration only; never hardcode them.",
      "Document authorization, audit, and data-handling expectations before shipping sensitive changes.",
      "Call for explicit review when a change touches authentication, permissions, payments, or data export.",
    ],
  };
}

export const genericSoftwarePreset: PresetDefinition = {
  key: "generic-software",
  title: "Generic software",
  defaultLanguage: "en",
  defaultProjectName: "Acme Platform",
  templateDirectory: "generic-software",
  paths: genericPaths,
  roles: genericRoles,
  buildTemplateContext,
};
