import type { HarnessConfig, HarnessPathsConfig, HarnessRoleConfig, TruthSourceConfig } from "./types.js";
import { dedent, escapeTomlString, joinLines, joinPath, relativePathList, renderTomlArray } from "./utils.js";

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface PresetDefinition {
  key: string;
  defaultLanguage: HarnessConfig["language"];
  defaultProjectName: string;
  paths: HarnessPathsConfig;
  roles: HarnessRoleConfig[];
  truthSources: TruthSourceConfig[];
  includeOverrideFile: boolean;
  buildManagedFiles(config: HarnessConfig): GeneratedFile[];
}

const genericPaths: HarnessPathsConfig = {
  docsRoot: "docs",
  sourceOfTruthDir: "docs/source-of-truth",
  runbooksDir: "docs/runbooks",
  plansActiveDir: "docs/plans/active",
  plansCompletedDir: "docs/plans/completed",
  logsActiveDir: "logs/codex/active",
  logsCompletedDir: "logs/codex/completed",
  codexDir: ".codex",
  codexAgentsDir: ".codex/agents",
  codexMemoryDir: ".codex/memory",
  codexEnvironmentFile: ".codex/environments/environment.toml",
};

const agentAdminPaths: HarnessPathsConfig = {
  ...genericPaths,
  sourceOfTruthDir: "dev-docs",
};

const genericTruthSources: TruthSourceConfig[] = [
  {
    key: "source-of-truth-index",
    path: "docs/source-of-truth/README.md",
    title: "Source Of Truth Index",
    summary: "Describes how the repository stores product, architecture, and delivery truths.",
  },
  {
    key: "project-overview",
    path: "docs/source-of-truth/project-overview.md",
    title: "Project Overview",
    summary: "Captures product goals, users, constraints, and non-goals.",
  },
  {
    key: "system-overview",
    path: "docs/source-of-truth/system-overview.md",
    title: "System Overview",
    summary: "Documents the high-level architecture, boundaries, and main flows.",
  },
  {
    key: "backend-architecture",
    path: "docs/source-of-truth/backend-architecture.md",
    title: "Backend Architecture",
    summary: "Defines backend module ownership, contracts, and implementation boundaries.",
  },
  {
    key: "frontend-architecture",
    path: "docs/source-of-truth/frontend-architecture.md",
    title: "Frontend Architecture",
    summary: "Defines route ownership, UI layering, and interaction boundaries.",
  },
  {
    key: "api-specification",
    path: "docs/source-of-truth/api-specification.md",
    title: "API Specification",
    summary: "Describes API contracts, request and response shapes, and compatibility expectations.",
  },
  {
    key: "integration-and-acceptance",
    path: "docs/source-of-truth/integration-and-acceptance.md",
    title: "Integration And Acceptance",
    summary: "Tracks integration rules, validation evidence, and release readiness expectations.",
  },
  {
    key: "quality-gates",
    path: "docs/source-of-truth/quality-gates.md",
    title: "Quality Gates",
    summary: "Defines the minimum verification bar for shipping changes.",
  },
];

const agentAdminTruthSources: TruthSourceConfig[] = [
  { key: "document-system-index", path: "dev-docs/00-document-system-index.md", title: "Document System Index", summary: "Owns the documentation system, reading order, and truth-source rules." },
  { key: "project-overview", path: "dev-docs/01-project-overview.md", title: "Project Overview", summary: "Defines product positioning, users, MVP boundaries, and non-goals." },
  { key: "system-overview", path: "dev-docs/02-system-overview.md", title: "System Overview", summary: "Defines modular-monolith boundaries and control-plane vs exec-plane ownership." },
  { key: "backend-development-architecture", path: "dev-docs/03-backend-development-architecture.md", title: "Backend Development Architecture", summary: "Defines backend modules, control-plane responsibilities, and implementation sequencing." },
  { key: "frontend-development-architecture", path: "dev-docs/04-frontend-development-architecture.md", title: "Frontend Development Architecture", summary: "Defines console routes, frontend layering, permissions, and SSE integration rules." },
  { key: "api-specification", path: "dev-docs/05-api-specification.md", title: "API Specification", summary: "Defines REST, SSE, pagination, and contract rules." },
  { key: "data-model-specification", path: "dev-docs/06-data-model-specification.md", title: "Data Model Specification", summary: "Defines entities, tables, JSON payload fields, and hot-vs-cold data placement." },
  { key: "enum-state-definitions", path: "dev-docs/07-enum-and-state-definitions.md", title: "Enum And State Definitions", summary: "Defines enums, statuses, and state-machine rules." },
  { key: "error-code-specification", path: "dev-docs/08-error-code-specification.md", title: "Error Code Specification", summary: "Defines platform error codes and their semantics." },
  { key: "common-fields-and-naming", path: "dev-docs/09-common-fields-and-naming.md", title: "Common Fields And Naming", summary: "Defines naming, shared fields, and path rules." },
  { key: "frontend-backend-collaboration", path: "dev-docs/10-frontend-backend-collaboration.md", title: "Frontend Backend Collaboration", summary: "Defines collaboration rules between frontend and backend teams." },
  { key: "integration-and-acceptance", path: "dev-docs/11-integration-and-acceptance.md", title: "Integration And Acceptance", summary: "Defines integration and acceptance evidence requirements." },
  { key: "development-plan", path: "dev-docs/12-development-plan.md", title: "Development Plan", summary: "Documents the phased development plan." },
  { key: "pre-development-checklist", path: "dev-docs/13-pre-development-checklist.md", title: "Pre-Development Checklist", summary: "Lists the minimum checks before feature work begins." },
  { key: "tool-development-plan", path: "dev-docs/14-tool-development-plan.md", title: "Tool Development Plan", summary: "Documents tool-related implementation priorities." },
  { key: "backend-architecture-spec", path: "spec/backend-architecture.md", title: "Backend Architecture Spec", summary: "Provides detailed runtime, control-plane, and module design." },
  { key: "frontend-architecture-spec", path: "spec/frontend-architecture.md", title: "Frontend Architecture Spec", summary: "Provides detailed console structure and UI patterns." },
  { key: "deep-research-report", path: "spec/deep-research-report.md", title: "Deep Research Report", summary: "Captures market and product rationale." },
  { key: "executor-protocol", path: "spec/executor-protocol.md", title: "Executor Protocol", summary: "Defines register, heartbeat, and invoke protocol behavior." },
  { key: "quality-gates", path: "spec/quality-gates.md", title: "Quality Gates", summary: "Defines critical validation rules." },
  { key: "run-stream-event-schema", path: "spec/run-stream-event-schema.md", title: "Run Stream Event Schema", summary: "Defines runtime streaming event contracts." },
  { key: "session-auth-contract", path: "spec/session-auth-contract.md", title: "Session Auth Contract", summary: "Defines session, refresh, and permission version behavior." },
  { key: "settings-secret-contract", path: "spec/settings-secret-contract.md", title: "Settings Secret Contract", summary: "Defines settings and secret behavior." },
  { key: "jobs-retention-operations", path: "spec/jobs-retention-operations.md", title: "Jobs Retention Operations", summary: "Defines jobs and retention operational rules." },
];

const genericRoles: HarnessRoleConfig[] = [
  {
    key: "architect-backend",
    name: "architect-backend",
    purpose: "Own backend architecture, service boundaries, and contract-sensitive backend changes.",
    model: "gpt-5.4",
    reasoningEffort: "high",
    memoryFile: ".codex/memory/backend.md",
    runbookFile: "docs/runbooks/backend-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/backend-agent.md",
      ".codex/memory/backend.md",
      "docs/source-of-truth/system-overview.md",
      "docs/source-of-truth/backend-architecture.md",
      "docs/source-of-truth/api-specification.md",
    ],
    scope: [
      "Backend services, modules, and contract ownership",
      "API, data model, permission, audit, and governance boundaries",
      "Implementation placement and backend change sequencing",
    ],
    doNot: [
      "Do not redesign frontend information architecture",
      "Do not weaken contract or permission guarantees without truth-source updates",
      "Do not invent new runtime semantics without alignment",
    ],
    handoffRequired: [
      "Touched backend modules and files",
      "Contract, permission, audit, and state impact",
      "Required truth-source updates",
      "Recommended next role",
    ],
    defaultOutput: [
      "Affected backend boundary",
      "Implementation recommendation",
      "Risk and validation notes",
    ],
  },
  {
    key: "architect-frontend",
    name: "architect-frontend",
    purpose: "Own information architecture, route placement, feature boundaries, and frontend contract consumption.",
    model: "gpt-5.4",
    reasoningEffort: "high",
    memoryFile: ".codex/memory/frontend.md",
    runbookFile: "docs/runbooks/frontend-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/frontend-agent.md",
      ".codex/memory/frontend.md",
      "docs/source-of-truth/system-overview.md",
      "docs/source-of-truth/frontend-architecture.md",
      "docs/source-of-truth/api-specification.md",
    ],
    scope: [
      "Route ownership and information architecture",
      "Feature, component, and adapter boundaries",
      "Permission, tenant-context, and real-time interaction design",
    ],
    doNot: [
      "Do not invent backend contract fields in UI code",
      "Do not absorb concrete UI polish that belongs to product-ui",
      "Do not turn the product into a chat-first or canvas-first experience",
    ],
    handoffRequired: [
      "Touched routes, features, or adapters",
      "Permission and real-time impact",
      "Contract dependencies",
      "Recommended next role",
    ],
    defaultOutput: [
      "Affected frontend boundary",
      "Architecture recommendation",
      "Risk and validation notes",
    ],
  },
  {
    key: "runtime-integrations",
    name: "runtime-integrations",
    purpose: "Own runtime orchestration, integrations, tool binding, and operational safety boundaries.",
    model: "gpt-5.4",
    reasoningEffort: "high",
    memoryFile: ".codex/memory/runtime.md",
    runbookFile: "docs/runbooks/runtime-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/runtime-agent.md",
      ".codex/memory/runtime.md",
      "docs/source-of-truth/system-overview.md",
      "docs/source-of-truth/backend-architecture.md",
      "docs/source-of-truth/api-specification.md",
    ],
    scope: [
      "Runtime orchestration and integration flows",
      "Safety, protocol, and event boundaries",
      "Tool binding and operational reliability",
    ],
    doNot: [
      "Do not move governance responsibility into integration endpoints",
      "Do not weaken preview vs formal safety rules without truth-source updates",
      "Do not redefine UI flows that belong to frontend roles",
    ],
    handoffRequired: [
      "Touched runtime or integration files",
      "Protocol, event, and security impact",
      "Required truth-source updates",
      "Recommended next role",
    ],
    defaultOutput: [
      "Affected runtime boundary",
      "Protocol or implementation recommendation",
      "Risk and validation notes",
    ],
  },
  {
    key: "product-ui",
    name: "product-ui",
    purpose: "Own concrete product pages, components, forms, tables, and detail views within approved frontend architecture.",
    model: "gpt-5.4",
    reasoningEffort: "medium",
    memoryFile: ".codex/memory/frontend.md",
    runbookFile: "docs/runbooks/frontend-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/frontend-agent.md",
      ".codex/memory/frontend.md",
      "docs/source-of-truth/frontend-architecture.md",
    ],
    scope: [
      "Pages and shared UI components",
      "Forms, tables, details, timelines, and state feedback",
      "Product UX polish inside approved architecture",
    ],
    doNot: [
      "Do not redefine route ownership or contract semantics",
      "Do not hardcode permission semantics in page components",
      "Do not replace product UX with marketing layout patterns",
    ],
    handoffRequired: [
      "Touched pages and components",
      "UI state and flow changes",
      "Dependent API or permission assumptions",
      "Recommended next role",
    ],
    defaultOutput: [
      "Affected page or component area",
      "Implementation summary",
      "Risk and validation notes",
    ],
  },
  {
    key: "reviewer",
    name: "reviewer",
    purpose: "Own correctness review, regression detection, boundary checks, and documentation drift detection.",
    model: "gpt-5.4",
    reasoningEffort: "high",
    memoryFile: ".codex/memory/decisions.md",
    runbookFile: "docs/runbooks/reviewer-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/reviewer-agent.md",
      ".codex/memory/decisions.md",
      "docs/index.md",
    ],
    scope: [
      "Correctness and regression review",
      "Boundary, contract, permission, and state checks",
      "Missing validation or documentation updates",
    ],
    doNot: [
      "Do not reduce review to style-only comments",
      "Do not hide unverified high-risk paths",
      "Do not expand the task into unsolicited refactors",
    ],
    handoffRequired: [
      "Ordered findings with severity",
      "Residual risk and testing gaps",
      "Recommended next role",
    ],
    defaultOutput: [
      "Findings first",
      "Residual risk summary",
      "Next-step recommendation",
    ],
  },
  {
    key: "qa-guard",
    name: "qa-guard",
    purpose: "Own validation closure, test matrix definition, quality-gate checks, and evidence of what was and was not verified.",
    model: "gpt-5.4",
    reasoningEffort: "medium",
    memoryFile: ".codex/memory/decisions.md",
    runbookFile: "docs/runbooks/qa-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/qa-agent.md",
      ".codex/memory/decisions.md",
      "docs/source-of-truth/integration-and-acceptance.md",
      "docs/source-of-truth/quality-gates.md",
    ],
    scope: [
      "Validation strategy and execution notes",
      "Quality-gate checks",
      "Explicit verified vs unverified reporting",
    ],
    doNot: [
      "Do not claim tests passed when they were not run",
      "Do not hide blocking gaps in critical flows",
      "Do not replace reviewer correctness checks",
    ],
    handoffRequired: [
      "Executed validations",
      "Unexecuted validations",
      "Blocking and non-blocking risks",
      "Recommended next role",
    ],
    defaultOutput: [
      "Validation matrix",
      "Quality-gate status",
      "Next-step recommendation",
    ],
  },
];

const agentAdminRoles: HarnessRoleConfig[] = [
  {
    key: "architect-backend",
    name: "architect-backend",
    purpose: "Own control-plane backend design, module boundaries, and contract-sensitive backend changes.",
    model: "gpt-5.4",
    reasoningEffort: "high",
    memoryFile: ".codex/memory/backend.md",
    runbookFile: "docs/runbooks/backend-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/backend-agent.md",
      ".codex/memory/backend.md",
      "dev-docs/02-system-overview.md",
      "dev-docs/03-backend-development-architecture.md",
      "spec/backend-architecture.md",
    ],
    scope: [
      "Control Plane backend modules",
      "API, data model, permission, audit, and governance boundaries",
      "Backend module placement and implementation shape",
    ],
    doNot: [
      "Do not redesign runtime internals that belong to Exec Plane",
      "Do not invent new API or enum semantics without source-of-truth alignment",
      "Do not expand into frontend UI work",
    ],
    handoffRequired: [
      "Touched backend modules and files",
      "Contract, tenant, permission, audit, and state-machine impact",
      "Required document sync",
      "Recommended next role",
    ],
    defaultOutput: [
      "Affected backend boundary",
      "Implementation recommendation",
      "Risk and validation notes",
    ],
  },
  {
    key: "architect-frontend",
    name: "architect-frontend",
    purpose: "Own console information architecture, route placement, feature boundaries, and frontend contract consumption.",
    model: "gpt-5.4",
    reasoningEffort: "high",
    memoryFile: ".codex/memory/frontend.md",
    runbookFile: "docs/runbooks/frontend-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/frontend-agent.md",
      ".codex/memory/frontend.md",
      "dev-docs/02-system-overview.md",
      "dev-docs/04-frontend-development-architecture.md",
      "spec/frontend-architecture.md",
    ],
    scope: [
      "Console route ownership",
      "Feature, component, and API adapter boundaries",
      "Permission, tenant-context, and SSE interaction design",
    ],
    doNot: [
      "Do not turn the product into a chat-first or canvas-first UI",
      "Do not invent contract fields outside the backend specification",
      "Do not absorb detailed visual implementation work that belongs to console-ui",
    ],
    handoffRequired: [
      "Touched routes, features, or API adapters",
      "Permission and SSE impact",
      "Contract dependencies",
      "Recommended next role",
    ],
    defaultOutput: [
      "Affected console boundary",
      "Information-architecture recommendation",
      "Risk and validation notes",
    ],
  },
  {
    key: "runtime-executor",
    name: "runtime-executor",
    purpose: "Own runtime orchestration, executor integration, tool binding, and run-chain protocol and safety boundaries.",
    model: "gpt-5.4",
    reasoningEffort: "high",
    memoryFile: ".codex/memory/runtime.md",
    runbookFile: "docs/runbooks/runtime-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/runtime-agent.md",
      ".codex/memory/runtime.md",
      "dev-docs/02-system-overview.md",
      "dev-docs/03-backend-development-architecture.md",
      "spec/backend-architecture.md",
      "spec/executor-protocol.md",
      "spec/run-stream-event-schema.md",
    ],
    scope: [
      "Runtime orchestration flow",
      "Executor protocol and safety rules",
      "Tool binding and run event semantics",
    ],
    doNot: [
      "Do not move governance responsibility from Control Plane into executors",
      "Do not weaken preview/formal run safety boundaries",
      "Do not change SSE or protocol semantics without source-of-truth updates",
    ],
    handoffRequired: [
      "Touched runtime or executor files",
      "Protocol, SSE, preview/formal, and security impact",
      "Required document sync",
      "Recommended next role",
    ],
    defaultOutput: [
      "Affected runtime boundary",
      "Protocol or implementation recommendation",
      "Risk and validation notes",
    ],
  },
  {
    key: "console-ui",
    name: "console-ui",
    purpose: "Own concrete console page, component, table, form, and detail-view implementation inside approved frontend architecture.",
    model: "gpt-5.4",
    reasoningEffort: "medium",
    memoryFile: ".codex/memory/frontend.md",
    runbookFile: "docs/runbooks/frontend-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/frontend-agent.md",
      ".codex/memory/frontend.md",
      "dev-docs/04-frontend-development-architecture.md",
      "spec/frontend-architecture.md",
    ],
    scope: [
      "Console pages and components",
      "Forms, tables, details, timelines, and state feedback",
      "B-end console UI polish without breaking architecture",
    ],
    doNot: [
      "Do not redefine route ownership or contract semantics without architect-frontend alignment",
      "Do not turn governance pages into marketing or chat UI",
      "Do not hardcode permission semantics in page components",
    ],
    handoffRequired: [
      "Touched pages and components",
      "UI states and flows changed",
      "Dependent API or permission assumptions",
      "Recommended next role",
    ],
    defaultOutput: [
      "Affected page or component area",
      "Implementation summary",
      "Risk and validation notes",
    ],
  },
  {
    key: "reviewer",
    name: "reviewer",
    purpose: "Own correctness review, regression detection, boundary checks, and document drift detection.",
    model: "gpt-5.4",
    reasoningEffort: "high",
    memoryFile: ".codex/memory/decisions.md",
    runbookFile: "docs/runbooks/reviewer-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/reviewer-agent.md",
      ".codex/memory/decisions.md",
      "docs/index.md",
    ],
    scope: [
      "Correctness and regression review",
      "Boundary, contract, state, permission, and audit checks",
      "Missing test or document updates",
    ],
    doNot: [
      "Do not expand task scope into unsolicited refactors",
      "Do not reduce review to style-only comments",
      "Do not ignore unverified high-risk paths",
    ],
    handoffRequired: [
      "Ordered findings with severity",
      "Residual risk and testing gaps",
      "Recommended next role",
    ],
    defaultOutput: [
      "Findings first",
      "Residual risk summary",
      "Next-step recommendation",
    ],
  },
  {
    key: "qa-guard",
    name: "qa-guard",
    purpose: "Own validation closure, test matrix definition, quality-gate checks, and evidence of what was and was not verified.",
    model: "gpt-5.4",
    reasoningEffort: "medium",
    memoryFile: ".codex/memory/decisions.md",
    runbookFile: "docs/runbooks/qa-agent.md",
    handoffPathHint: "logs/codex/active/<task-slug>/handoff.md",
    readFirst: [
      "docs/runbooks/qa-agent.md",
      ".codex/memory/decisions.md",
      "dev-docs/11-integration-and-acceptance.md",
      "spec/quality-gates.md",
    ],
    scope: [
      "Validation strategy and execution notes",
      "Quality-gate checks",
      "Explicit verified vs unverified reporting",
    ],
    doNot: [
      "Do not claim tests passed when they were not run",
      "Do not hide blocking gaps in critical flows",
      "Do not replace reviewer correctness checks",
    ],
    handoffRequired: [
      "Executed validations",
      "Unexecuted validations",
      "Blocking and non-blocking risks",
      "Recommended next role",
    ],
    defaultOutput: [
      "Validation matrix",
      "Quality-gate status",
      "Next-step recommendation",
    ],
  },
];

function buildRoleToml(role: HarnessRoleConfig): string {
  return [
    `name = "${escapeTomlString(role.name)}"`,
    `purpose = "${escapeTomlString(role.purpose)}"`,
    `model = "${escapeTomlString(role.model)}"`,
    `reasoning_effort = "${escapeTomlString(role.reasoningEffort)}"`,
    `memory_file = "${escapeTomlString(role.memoryFile)}"`,
    `runbook_file = "${escapeTomlString(role.runbookFile)}"`,
    `handoff_path_hint = "${escapeTomlString(role.handoffPathHint)}"`,
    "",
    `read_first = ${renderTomlArray(role.readFirst)}`,
    "",
    `scope = ${renderTomlArray(role.scope)}`,
    "",
    `do_not = ${renderTomlArray(role.doNot)}`,
    "",
    `handoff_required = ${renderTomlArray(role.handoffRequired)}`,
    "",
    `default_output = ${renderTomlArray(role.defaultOutput)}`,
  ].join("\n");
}

function buildCodexConfig(projectName: string): string {
  return dedent(`
    # Project-local Codex baseline for ${projectName}.
    # Verified local baseline: enable multi-agent at the repo level.
    # Fixed role definitions live under \`.codex/agents/\` and are consumed by
    # repository runbooks and bootstrap prompts.

    [features]
    multi_agent = true
  `);
}

function buildActivePlansReadme(): string {
  return dedent(`
    # Active Plans

    This directory stores long-running plans for work that is still in progress.

    ## 1. When to create a plan

    Create a plan whenever any of the following is true:

    - The task spans multiple rounds or multiple threads.
    - The task requires multiple fixed roles.
    - The main thread needs durable context beyond the current conversation.
    - The task is class B or class C.

    ## 2. File naming

    Recommended format:

    - \`YYYY-MM-DD-<task-slug>.md\`

    ## 3. Minimum template

    \`\`\`md
    # <task title>

    ## Background

    ## Goal

    ## Scope

    ## Out Of Scope

    ## Truth Sources

    ## Current Decisions

    ## Work Breakdown

    ## Validation Plan

    ## Risks And Blockers

    ## Required Roles

    ## Required Memory Or Handoff Updates
    \`\`\`

    ## 4. Completion

    Before moving a plan to \`../completed/\`:

    1. Record the outcome and residual risk.
    2. Confirm the handoff and memory files were updated.
    3. Archive the plan and matching logs.
  `);
}

function buildCompletedPlansReadme(): string {
  return dedent(`
    # Completed Plans

    This directory archives long-running plans that reached a terminal state.

    ## 1. Before archiving

    - The active plan has a final outcome summary.
    - Matching run log and handoff files exist under \`logs/codex/\`.
    - Durable conclusions were copied into \`.codex/memory/\` where needed.
    - Required truth-source updates are either complete or explicitly deferred.

    ## 2. Minimum completion sections

    Add these sections before moving a plan here:

    \`\`\`md
    ## Result

    ## Actual Changes

    ## Verified

    ## Unverified

    ## Residual Risks

    ## Follow-Up
    \`\`\`
  `);
}

function buildActiveLogsReadme(): string {
  return dedent(`
    # Active Codex Logs

    This directory records run logs and handoffs for in-progress tasks.

    ## 1. Recommended structure

    \`\`\`text
    logs/codex/active/
      <task-slug>/
        run.md
        handoff.md
        artifacts/
    \`\`\`

    ## 2. Minimum \`run.md\` template

    \`\`\`md
    # <task title>

    ## Context

    ## Timeline

    ## Commands

    ## Verification Notes

    ## Open Questions
    \`\`\`

    ## 3. Minimum \`handoff.md\` template

    \`\`\`md
    # <task title> Handoff

    ## Current Goal

    ## Completed

    ## In Progress

    ## Key Files

    ## Key Decisions

    ## Risks

    ## Suggested Next Steps

    ## Suggested Next Role
    \`\`\`
  `);
}

function buildCompletedLogsReadme(): string {
  return dedent(`
    # Completed Codex Logs

    This directory archives run logs for completed or paused tasks.

    ## 1. Archive structure

    Keep the same shape as \`../active/\`:

    \`\`\`text
    logs/codex/completed/
      <task-slug>/
        run.md
        handoff.md
        artifacts/
    \`\`\`
  `);
}

function buildEnvironmentToml(projectName: string, devCommand: string): string {
  return dedent(`
    # THIS IS AUTOGENERATED. DO NOT EDIT MANUALLY
    version = 1
    name = "${escapeTomlString(projectName)}"

    [setup]
    script = ""

    [[actions]]
    name = "Run"
    icon = "run"
    command = "${escapeTomlString(devCommand)}"
  `);
}

function buildGenericAgentsReadme(config: HarnessConfig): string {
  return dedent(`
    # Fixed Agent Pool

    This directory is the repository-owned source of truth for the fixed ${config.projectName}
    Codex role pool.

    ## Purpose

    - Keep the same narrow-role subagents reusable across threads.
    - Store role context in repository files instead of relying on chat history.
    - Give the orchestration main thread a stable place to load role scope before dispatching work.

    ## Fixed roles

    ${relativePathList(config.roles.map((role) => `${config.paths.codexAgentsDir}/${role.key}.toml`))}

    ## Dispatch order

    When dispatching a role, load context in this order:

    1. \`.codex/agents/<role>.toml\`
    2. \`docs/runbooks/<role-runbook>.md\`
    3. \`.codex/memory/<domain>.md\`
    4. The latest matching handoff
    5. The current plan and source-of-truth docs
  `);
}

function buildMemoryRegistry(config: HarnessConfig): string {
  return dedent(`
    # Codex Memory Registry

    This directory stores durable memory for ${config.projectName}. It should keep stable
    facts that future threads can reload before relying on chat history.

    ## 1. Read order

    Main threads and fixed roles should read, in order:

    1. This file
    2. \`../config.toml\`
    3. \`../agents/README.md\`
    4. The matching \`../agents/<role>.toml\`
    5. The matching domain memory
    6. The latest handoff
    7. The active plan

    ## 2. Memory files

    | File | Purpose |
    | --- | --- |
    | \`backend.md\` | Stable backend boundaries, recurring risks, and reading order |
    | \`frontend.md\` | Stable frontend boundaries, route rules, and UI constraints |
    | \`runtime.md\` | Stable runtime, integration, and safety boundaries |
    | \`decisions.md\` | Cross-domain durable decisions and shared operating rules |
  `);
}

function buildGenericDocsIndex(config: HarnessConfig): string {
  return dedent(`
    # ${config.projectName} Documentation Index

    This file is the Codex harness entrypoint for the repository. It links source-of-truth docs,
    fixed role runbooks, durable memory, and task artifacts together.

    ## 1. Read first

    Main-thread default order:

    1. \`../AGENTS.md\`
    2. If present, \`../AGENTS.override.md\`
    3. This file
    4. \`../.codex/config.toml\`
    5. \`../.codex/agents/README.md\`
    6. \`../.codex/memory/registry.md\`
    7. The matching runbook
    8. The most recent handoff
    9. Only then the implementation

    ## 2. Source of truth docs

    ${config.truthSources.map((source) => `- \`../${source.path}\` — ${source.summary}`).join("\n")}

    ## 3. Harness-owned files

    - \`../.codex/config.toml\`
    - \`../.codex/agents/\`
    - \`../.codex/memory/\`
    - \`./runbooks/\`
    - \`./plans/active/\`
    - \`./plans/completed/\`
    - \`../logs/codex/active/\`
    - \`../logs/codex/completed/\`
  `);
}

function buildGenericAgentsMd(config: HarnessConfig): string {
  return dedent(`
    # AGENTS.md

    ${config.projectName}'s repository collaboration entrypoint stays short. Detailed truth
    belongs in \`docs/source-of-truth/\`, \`docs/\`, and \`.codex/memory/\`.

    ## 1. Priorities

    Resolve conflicts in this order:

    1. The current task
    2. \`AGENTS.override.md\`
    3. This file
    4. \`docs/index.md\`
    5. Source-of-truth docs
    6. The current code
    7. Chat inference

    ## 2. Before starting any task

    Main threads should read:

    1. \`docs/index.md\`
    2. The matching runbook
    3. \`.codex/memory/registry.md\`
    4. Relevant domain memory
    5. The latest handoff
    6. Then the code

    ## 3. Long-running task artifacts

    Durable task artifacts live in:

    - \`docs/plans/active/<task-slug>.md\`
    - \`logs/codex/active/<task-slug>/run.md\`
    - \`logs/codex/active/<task-slug>/handoff.md\`
    - \`.codex/memory/*.md\`

    ## 4. Fixed roles

    ${config.roles.map((role) => `- \`${role.key}\``).join("\n")}

    ## 5. Main-thread responsibilities

    The main thread exists to:

    - break work into scoped tasks
    - choose fixed roles
    - keep plans, logs, and handoffs current
    - summarize outputs and identify truth-source updates

    Do not let subagents rely on chat history alone. Point them at repository files first.
  `);
}

function buildGenericMemoryFiles(): Record<string, string> {
  return {
    ".codex/memory/backend.md": dedent(`
      # Backend Memory

      ## Stable position

      - The backend exists to own durable service boundaries and governance semantics.
      - Contract and permission changes must align with source-of-truth docs first.
      - Shared code should stay focused and not absorb domain logic by accident.

      ## Common risks

      - Letting current code shape override the documented boundary.
      - Changing API semantics without updating truth sources.
      - Hiding permission or audit checks inside scattered helpers.
    `),
    ".codex/memory/frontend.md": dedent(`
      # Frontend Memory

      ## Stable position

      - The product UI is not a marketing site and not a chat shell by default.
      - Route ownership, permission rules, and adapter boundaries belong in repository docs.
      - Shared components should not absorb domain semantics.

      ## Common risks

      - Inventing unconfirmed fields in page code.
      - Hardcoding permission meaning in UI components.
      - Letting visual polish rewrite information architecture.
    `),
    ".codex/memory/runtime.md": dedent(`
      # Runtime Memory

      ## Stable position

      - Runtime and integrations own orchestration safety, not product governance.
      - Preview, formal execution, and side-effect rules must stay explicit.
      - Event or protocol changes require truth-source alignment before shipping.

      ## Common risks

      - Hardcoding tool behavior inside orchestration code.
      - Mixing governance ownership into execution endpoints.
      - Changing event semantics without updating validation docs.
    `),
    ".codex/memory/decisions.md": dedent(`
      # Durable Decisions

      ## Current baseline

      - Repository collaboration is file-first, not chat-history-first.
      - Long-running work must leave plan, run-log, handoff, and memory traces.
      - Fixed roles should be reused before creating temporary roles.
      - Main-thread orchestration should preserve source-of-truth precedence over code drift.
    `),
  };
}

function buildGenericRunbooks(config: HarnessConfig): GeneratedFile[] {
  const roleMap = new Map(config.roles.map((role) => [role.key, role] as const));
  const runtimeRole = roleMap.get("runtime-integrations");
  const uiRole = roleMap.get("product-ui");

  return [
    {
      path: "docs/runbooks/codex-main-thread.md",
      content: dedent(`
        # Codex Main Thread Runbook

        This runbook constrains the single orchestration thread for ${config.projectName}.
        The main thread coordinates work, preserves context, and integrates fixed-role outputs.

        ## 1. Read before starting

        1. \`../../AGENTS.md\`
        2. If present, \`../../AGENTS.override.md\`
        3. \`../index.md\`
        4. \`../../.codex/config.toml\`
        5. \`../../.codex/agents/README.md\`
        6. \`./main-thread-bootstrap.md\`
        7. \`../../.codex/memory/registry.md\`
        8. Relevant domain memory
        9. The latest handoff
        10. Relevant source-of-truth docs

        ## 2. Fixed duties

        - classify the task
        - define scope and validation
        - select fixed roles
        - maintain plan, run log, and handoff
        - summarize risks and truth-source updates

        ## 3. Fixed role pool

        ${config.roles.map((role) => `- \`${role.key}\``).join("\n")}

        ## 4. Task artifact locations

        - \`../../docs/plans/active/<task-slug>.md\`
        - \`../../logs/codex/active/<task-slug>/run.md\`
        - \`../../logs/codex/active/<task-slug>/handoff.md\`
      `),
    },
    {
      path: "docs/runbooks/main-thread-bootstrap.md",
      content: dedent(`
        # Main Thread Bootstrap

        This file gives a new orchestration main thread a reusable startup prompt and
        dispatch templates for the fixed role pool.

        ## 1. Main-thread startup checklist

        1. Read \`AGENTS.md\`.
        2. Read \`AGENTS.override.md\` if it exists.
        3. Read \`docs/index.md\`.
        4. Read \`.codex/config.toml\`.
        5. Read \`.codex/agents/README.md\`.
        6. Read \`docs/runbooks/codex-main-thread.md\`.
        7. Read \`.codex/memory/registry.md\`.
        8. Read relevant domain memory.
        9. Read the latest handoff.
        10. Read the relevant source-of-truth docs.

        ## 2. Fixed role pool

        ${config.roles.map((role) => `- \`${role.key}\``).join("\n")}

        ## 3. Dispatch templates

        ${config.roles
          .map((role) => {
            const outOfScope = role.doNot.map((item) => `- ${item}`).join("\n");
            const readFirst = role.readFirst.map((item, index) => `${index + 1}. \`${item}\``).join("\n");
            const output = role.defaultOutput.map((item) => `- ${item}`).join("\n");
            const handoff = role.handoffRequired.map((item) => `- ${item}`).join("\n");
            return dedent(`
              ### \`${role.key}\`

              \`\`\`text
              You are the \`${role.key}\` fixed role for ${config.projectName}.

              Goal:
              <fill in the task goal>

              Scope:
              ${role.scope.map((item) => `- ${item}`).join("\n")}

              Out of scope:
              ${outOfScope}

              Read first:
              ${readFirst}

              Expected output:
              ${output}

              Handoff requirements:
              ${handoff}
              \`\`\`
            `);
          })
          .join("\n\n")}

        ## 4. Reuse rules

        1. Reuse the fixed roles before inventing temporary ones.
        2. Keep plans, run logs, handoffs, and memory updated after each round.
        3. Point every role at repository files before relying on chat history.
      `),
    },
    {
      path: "docs/runbooks/backend-agent.md",
      content: dedent(`
        # Backend Agent Runbook

        This runbook serves \`architect-backend\`.

        ## 1. Scope

        - service modules and backend boundaries
        - API, data, permission, audit, and governance constraints
        - implementation placement and backend sequencing

        ## 2. Read before starting

        1. \`../index.md\`
        2. \`../../.codex/memory/backend.md\`
        3. \`../../docs/source-of-truth/system-overview.md\`
        4. \`../../docs/source-of-truth/backend-architecture.md\`
        5. \`../../docs/source-of-truth/api-specification.md\`

        ## 3. Handoff

        Record touched modules, contract impact, validation status, and the next recommended role.
      `),
    },
    {
      path: "docs/runbooks/frontend-agent.md",
      content: dedent(`
        # Frontend Agent Runbook

        This runbook serves both \`architect-frontend\` and \`${uiRole?.key ?? "product-ui"}\`.

        ## 1. Shared scope

        - route ownership and product structure
        - feature, component, and adapter boundaries
        - permission, tenant-context, and real-time interaction design
        - concrete pages, tables, forms, details, and state feedback

        ## 2. Read before starting

        1. \`../index.md\`
        2. \`../../.codex/memory/frontend.md\`
        3. \`../../docs/source-of-truth/system-overview.md\`
        4. \`../../docs/source-of-truth/frontend-architecture.md\`
        5. \`../../docs/source-of-truth/api-specification.md\`

        ## 3. Boundary rule

        Architecture questions should be settled by \`architect-frontend\` before \`${uiRole?.key ?? "product-ui"}\`
        lands concrete UI changes.
      `),
    },
    {
      path: "docs/runbooks/runtime-agent.md",
      content: dedent(`
        # Runtime Agent Runbook

        This runbook serves \`${runtimeRole?.key ?? "runtime-integrations"}\`.

        ## 1. Scope

        - runtime orchestration and integration flows
        - tool binding and operational safety
        - event, protocol, and validation boundaries

        ## 2. Read before starting

        1. \`../index.md\`
        2. \`../../.codex/memory/runtime.md\`
        3. \`../../docs/source-of-truth/system-overview.md\`
        4. \`../../docs/source-of-truth/backend-architecture.md\`
        5. \`../../docs/source-of-truth/api-specification.md\`
        6. \`../../docs/source-of-truth/quality-gates.md\`
      `),
    },
    {
      path: "docs/runbooks/reviewer-agent.md",
      content: dedent(`
        # Reviewer Agent Runbook

        This runbook serves \`reviewer\`.

        ## 1. Review order

        1. product direction drift
        2. boundary breakage
        3. contract, permission, and state regressions
        4. missing validation
        5. readability and maintainability

        ## 2. Output rule

        Findings come first. If there are no findings, report residual risk and unverified paths anyway.
      `),
    },
    {
      path: "docs/runbooks/qa-agent.md",
      content: dedent(`
        # QA Agent Runbook

        This runbook serves \`qa-guard\`.

        ## 1. Scope

        - validation matrix design
        - quality-gate checks
        - explicit verified vs unverified reporting

        ## 2. Read before starting

        1. \`../index.md\`
        2. the current plan
        3. the current run log and handoff
        4. \`../../docs/source-of-truth/integration-and-acceptance.md\`
        5. \`../../docs/source-of-truth/quality-gates.md\`
      `),
    },
  ];
}

function buildGenericSourceOfTruthFiles(config: HarnessConfig): GeneratedFile[] {
  return config.truthSources.map((source) => ({
    path: source.path,
    content: dedent(`
      # ${source.title}

      ${source.summary}

      ## Purpose

      Capture the durable truth for ${config.projectName} in this area.

      ## Current Baseline

      - Fill in the current agreed behavior.
      - Record decisions before implementation drifts.
      - Link related plans, handoffs, and validation evidence.
    `),
  }));
}

function buildGenericManagedFiles(config: HarnessConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { path: "AGENTS.md", content: buildGenericAgentsMd(config) },
    { path: ".codex/config.toml", content: buildCodexConfig(config.projectName) },
    { path: ".codex/agents/README.md", content: buildGenericAgentsReadme(config) },
    { path: ".codex/memory/registry.md", content: buildMemoryRegistry(config) },
    { path: "docs/index.md", content: buildGenericDocsIndex(config) },
    { path: "docs/plans/active/README.md", content: buildActivePlansReadme() },
    { path: "docs/plans/completed/README.md", content: buildCompletedPlansReadme() },
    { path: "logs/codex/active/README.md", content: buildActiveLogsReadme() },
    { path: "logs/codex/completed/README.md", content: buildCompletedLogsReadme() },
    ...buildGenericRunbooks(config),
    ...buildGenericSourceOfTruthFiles(config),
  ];

  for (const role of config.roles) {
    files.push({
      path: joinPath(config.paths.codexAgentsDir, `${role.key}.toml`),
      content: buildRoleToml(role),
    });
  }

  for (const [path, content] of Object.entries(buildGenericMemoryFiles())) {
    files.push({ path, content });
  }

  if (config.devCommand) {
    files.push({
      path: config.paths.codexEnvironmentFile,
      content: buildEnvironmentToml(config.projectName, config.devCommand),
    });
  }

  return files;
}

function buildAgentAdminDocsIndex(): string {
  return dedent(`
    # AgentAdmin Documentation Index

    This file is the Codex harness entrypoint for the repository. It links source-of-truth docs,
    runbooks, memory, and task artifacts together.

    ## 1. Read first

    Main-thread default order:

    1. \`../AGENTS.md\`
    2. If present, \`../AGENTS.override.md\`
    3. This file
    4. \`../.codex/config.toml\`
    5. \`../.codex/agents/README.md\`
    6. \`../.codex/memory/registry.md\`
    7. The matching runbook
    8. The latest handoff
    9. Then the implementation

    ## 2. Truth-source layering

    - \`../dev-docs/\` owns project, system, backend, frontend, API, data-model, enum, error-code, naming, collaboration, integration, and checklist truths.
    - \`../spec/\` owns protocol-level and deep-dive design docs.
    - \`../docs/\` owns Codex harness instructions, plans, and task artifacts.

    ## 3. Harness-owned files

    - \`../.codex/config.toml\`
    - \`../.codex/agents/\`
    - \`../.codex/memory/\`
    - \`./runbooks/\`
    - \`./plans/active/\`
    - \`./plans/completed/\`
    - \`../logs/codex/active/\`
    - \`../logs/codex/completed/\`
  `);
}

function buildAgentAdminAgentsMd(): string {
  return dedent(`
    # AGENTS.md

    AgentAdmin keeps the repository collaboration entrypoint short. Detailed truths live in
    \`dev-docs/\`, \`spec/\`, \`docs/\`, and \`.codex/memory/\`.

    ## 1. Project direction

    - Java-first, not a chat product or workflow canvas.
    - Keep a modular monolith and Control Plane / Exec Plane boundaries by default.
    - Backend stays governance-first; frontend stays console-first.
    - executor / starter integration remains a differentiated core capability.

    ## 2. Priority order

    Resolve conflicts in this order:

    1. The explicit task request
    2. \`AGENTS.override.md\`
    3. This file
    4. \`docs/index.md\`
    5. \`dev-docs/\` and \`spec/\`
    6. Current code
    7. Chat inference

    ## 3. Before starting any task

    Main threads read:

    1. \`docs/index.md\`
    2. The matching runbook
    3. \`.codex/memory/registry.md\`
    4. Relevant domain memory
    5. The latest handoff
    6. Then the code

    ## 4. Durable task artifacts

    - \`docs/plans/active/<task-slug>.md\`
    - \`logs/codex/active/<task-slug>/run.md\`
    - \`logs/codex/active/<task-slug>/handoff.md\`
    - \`.codex/memory/*.md\`

    ## 5. Fixed roles

    - \`architect-backend\`
    - \`architect-frontend\`
    - \`runtime-executor\`
    - \`console-ui\`
    - \`reviewer\`
    - \`qa-guard\`
  `);
}

function buildAgentAdminAgentsReadme(): string {
  return dedent(`
    # Fixed Agent Pool

    This directory is the repository-owned source of truth for the fixed AgentAdmin
    subagent pool.

    ## Purpose

    - Keep the same narrow-role subagents reusable across threads.
    - Store role context in repo files instead of relying on chat history.
    - Give the orchestration main thread a stable place to load role scope before dispatching work.

    ## Fixed roles

    - \`architect-backend.toml\`
    - \`architect-frontend.toml\`
    - \`runtime-executor.toml\`
    - \`console-ui.toml\`
    - \`reviewer.toml\`
    - \`qa-guard.toml\`
  `);
}

function buildAgentAdminMemoryRegistry(): string {
  return dedent(`
    # Codex Memory Registry

    This directory stores reusable durable memory. Its goal is to let future threads read
    repository facts first, then rely on chat as a supplement.

    ## 1. Read order

    1. This file
    2. \`../config.toml\`
    3. \`../agents/README.md\`
    4. The matching \`../agents/<role>.toml\`
    5. The matching domain memory
    6. The latest handoff
    7. The active plan

    ## 2. Memory files

    | File | Purpose |
    | --- | --- |
    | \`backend.md\` | Stable Control Plane backend boundaries and recurring risks |
    | \`frontend.md\` | Stable console frontend boundaries, route rules, and UI constraints |
    | \`runtime.md\` | Stable runtime, executor, tool-binding, and SSE boundaries |
    | \`decisions.md\` | Cross-domain durable decisions and common operating rules |
  `);
}

function buildAgentAdminMemoryFiles(): Record<string, string> {
  return {
    ".codex/memory/backend.md": dedent(`
      # Backend Memory

      ## 1. Stable position

      - AgentAdmin backend is a governance control plane first, not the business system itself.
      - The baseline remains a modular monolith with dual-plane boundaries.
      - \`agentadmin-server\` is the main control-plane application.
      - \`agentadmin-runtime\` is a shared runtime kernel, not a generic \`core\`.
      - \`agentadmin-tool-support\` only provides MCP and SYSTEM tool support, not tool governance.
    `),
    ".codex/memory/frontend.md": dedent(`
      # Frontend Memory

      ## 1. Stable position

      - The frontend is a governance console, not a chat shell and not a workflow canvas.
      - Routes must clearly separate platform, personal, and tenant scopes.
      - Tenant context belongs in the URL; permissions are determined by permission nodes plus backend payloads.
    `),
    ".codex/memory/runtime.md": dedent(`
      # Runtime Memory

      ## 1. Stable position

      - Runtime is responsible for orchestrating one agent execution, not a heavyweight workflow engine.
      - Exec Plane owns real execution; Control Plane owns governance, routing, auditing, and observability.
      - The v1 execution baseline is \`DIRECT_HTTP\`.
    `),
    ".codex/memory/decisions.md": dedent(`
      # Durable Decisions

      ## Current durable decisions

      - AgentAdmin is a Java-first agent access and governance platform.
      - The architecture stays modular-monolith-first with explicit Control Plane / Exec Plane boundaries.
      - executor / starter integration remains a core differentiator.
      - Harness collaboration is file-first: \`docs/\`, \`logs/codex/\`, and \`.codex/memory/\` carry durable context.
    `),
  };
}

function buildAgentAdminRunbooks(config: HarnessConfig): GeneratedFile[] {
  return [
    {
      path: "docs/runbooks/codex-main-thread.md",
      content: dedent(`
        # Codex Main Thread Runbook

        This runbook constrains the single orchestration thread. The main thread is responsible for
        scoping work, selecting fixed roles, keeping shared context durable, and integrating results.

        ## 1. Read before starting

        1. \`../../AGENTS.md\`
        2. If present, \`../../AGENTS.override.md\`
        3. \`../index.md\`
        4. \`../../.codex/config.toml\`
        5. \`../../.codex/agents/README.md\`
        6. \`./main-thread-bootstrap.md\`
        7. \`../../.codex/memory/registry.md\`
        8. Relevant domain memory
        9. The latest handoff
        10. Relevant truth-source docs

        ## 2. Fixed role pool

        ${config.roles.map((role) => `- \`${role.key}\``).join("\n")}
      `),
    },
    {
      path: "docs/runbooks/main-thread-bootstrap.md",
      content: dedent(`
        # Main Thread Bootstrap

        This file gives a new orchestration main thread a copy-paste prompt plus fixed-role dispatch templates.

        ## 1. Applicable scenarios

        - A new main thread takes ownership of the AgentAdmin repository.
        - The main thread needs to absorb background first, then split work and establish fixed roles.
        - The goal is to reuse repository-owned context instead of relying on the previous chat alone.

        ## 2. Main-thread startup prompt

        \`\`\`text
        You are now the sole orchestration main thread for AgentAdmin.

        Your job is not to implement everything directly. Read repository truth sources first, reuse
        harness files, maintain plans, route work into the fixed role pool, and persist durable context.

        Read in this order:
        1. AGENTS.md
        2. AGENTS.override.md if it exists
        3. docs/index.md
        4. .codex/config.toml
        5. .codex/agents/README.md
        6. docs/runbooks/main-thread-bootstrap.md
        7. docs/runbooks/codex-main-thread.md
        8. .codex/memory/registry.md
        9. domain memory files as needed
        10. the latest handoff
        11. relevant truth-source docs

        The fixed role pool must contain:
        - architect-backend
        - architect-frontend
        - runtime-executor
        - console-ui
        - reviewer
        - qa-guard
        \`\`\`

        ## 3. Dispatch templates

        ${config.roles
          .map((role) => {
            const outOfScope = role.doNot.map((item) => `- ${item}`).join("\n");
            const readFirst = role.readFirst.map((item, index) => `${index + 1}. \`${item}\``).join("\n");
            const output = role.defaultOutput.map((item) => `- ${item}`).join("\n");
            const handoff = role.handoffRequired.map((item) => `- ${item}`).join("\n");
            return dedent(`
              ### \`${role.key}\`

              \`\`\`text
              You are AgentAdmin's \`${role.key}\` fixed role.

              Goal:
              <fill in the task goal>

              Scope:
              ${role.scope.map((item) => `- ${item}`).join("\n")}

              Out of scope:
              ${outOfScope}

              Read first:
              ${readFirst}

              Expected output:
              ${output}

              Handoff requirements:
              ${handoff}
              \`\`\`
            `);
          })
          .join("\n\n")}
      `),
    },
    {
      path: "docs/runbooks/backend-agent.md",
      content: dedent(`
        # Backend Agent Runbook

        This runbook serves \`architect-backend\`.

        ## 1. Scope

        - Auth / Tenant / RBAC
        - Agent / Prompt / Tool / Model / Secret / Audit / Jobs
        - Control-plane Controller / Service / Mapper / DTO / Repository boundaries
        - API contracts, data models, error codes, naming, and implementation placement

        ## 2. Read before starting

        1. \`../index.md\`
        2. \`../../.codex/memory/backend.md\`
        3. \`../../dev-docs/02-system-overview.md\`
        4. \`../../dev-docs/03-backend-development-architecture.md\`
        5. \`../../dev-docs/05-api-specification.md\`
        6. \`../../dev-docs/06-data-model-specification.md\`
        7. \`../../dev-docs/07-enum-and-state-definitions.md\`
        8. \`../../dev-docs/08-error-code-specification.md\`
        9. \`../../dev-docs/09-common-fields-and-naming.md\`
        10. \`../../dev-docs/10-frontend-backend-collaboration.md\`
        11. \`../../spec/backend-architecture.md\`
      `),
    },
    {
      path: "docs/runbooks/frontend-agent.md",
      content: dedent(`
        # Frontend Agent Runbook

        This runbook serves both \`architect-frontend\` and \`console-ui\`.

        ## 1. Shared scope

        - platform, personal, and tenant console routes
        - console navigation, page structure, and feature directory boundaries
        - permission nodes, tenant switching, and SSE flows
        - forms, tables, detail pages, state feedback, and risk confirmations

        ## 2. Read before starting

        1. \`../index.md\`
        2. \`../../.codex/memory/frontend.md\`
        3. \`../../dev-docs/02-system-overview.md\`
        4. \`../../dev-docs/04-frontend-development-architecture.md\`
        5. \`../../dev-docs/05-api-specification.md\`
        6. \`../../dev-docs/07-enum-and-state-definitions.md\`
        7. \`../../dev-docs/08-error-code-specification.md\`
        8. \`../../dev-docs/09-common-fields-and-naming.md\`
        9. \`../../dev-docs/10-frontend-backend-collaboration.md\`
        10. \`../../spec/frontend-architecture.md\`
      `),
    },
    {
      path: "docs/runbooks/runtime-agent.md",
      content: dedent(`
        # Runtime Agent Runbook

        This runbook serves \`runtime-executor\`.

        ## 1. Scope

        - agent loading and version resolution
        - prompt assembly and model selection
        - tool allowlists, binding, and invocation loops
        - executor register / heartbeat / invoke
        - preview / formal run constraints
        - run / step / event / SSE chains

        ## 2. Read before starting

        1. \`../index.md\`
        2. \`../../.codex/memory/runtime.md\`
        3. \`../../dev-docs/02-system-overview.md\`
        4. \`../../dev-docs/03-backend-development-architecture.md\`
        5. \`../../dev-docs/05-api-specification.md\`
        6. \`../../dev-docs/06-data-model-specification.md\`
        7. \`../../dev-docs/07-enum-and-state-definitions.md\`
        8. \`../../dev-docs/08-error-code-specification.md\`
        9. \`../../dev-docs/11-integration-and-acceptance.md\`
        10. \`../../spec/backend-architecture.md\`
        11. \`../../spec/executor-protocol.md\`
        12. \`../../spec/run-stream-event-schema.md\`
      `),
    },
    {
      path: "docs/runbooks/reviewer-agent.md",
      content: dedent(`
        # Reviewer Agent Runbook

        This runbook serves \`reviewer\`.

        ## 1. Review order

        1. Product-direction drift
        2. Module-boundary breakage
        3. Tenant, permission, audit, and governance regressions
        4. API, state, error-code, and SSE regressions
        5. Missing tests or documentation
        6. Readability and maintainability
      `),
    },
    {
      path: "docs/runbooks/qa-agent.md",
      content: dedent(`
        # QA Agent Runbook

        This runbook serves \`qa-guard\`.

        ## 1. Scope

        - validation matrix design
        - unit / integration / contract / E2E / manual verification checklists
        - quality-gate checks
        - task-end validation closure

        ## 2. Read before starting

        1. \`../index.md\`
        2. the current plan
        3. the current run log and handoff
        4. \`../../dev-docs/11-integration-and-acceptance.md\`
        5. \`../../dev-docs/13-pre-development-checklist.md\`
        6. \`../../spec/quality-gates.md\`
      `),
    },
  ];
}

function buildAgentAdminTruthSourceFiles(config: HarnessConfig): GeneratedFile[] {
  return config.truthSources.map((source) => ({
    path: source.path,
    content: dedent(`
      # ${source.title}

      ${source.summary}

      ## Current Baseline

      - Fill in the durable truth for AgentAdmin in this area.
      - Update this file before implementation semantics drift.
      - Link matching plans, handoffs, and validation evidence when relevant.
    `),
  }));
}

function buildAgentAdminManagedFiles(config: HarnessConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { path: "AGENTS.md", content: buildAgentAdminAgentsMd() },
    { path: "AGENTS.override.md", content: buildAgentAdminAgentsMd() },
    { path: ".codex/config.toml", content: buildCodexConfig(config.projectName) },
    { path: ".codex/agents/README.md", content: buildAgentAdminAgentsReadme() },
    { path: ".codex/memory/registry.md", content: buildAgentAdminMemoryRegistry() },
    { path: "docs/index.md", content: buildAgentAdminDocsIndex() },
    { path: "docs/plans/active/README.md", content: buildActivePlansReadme() },
    { path: "docs/plans/completed/README.md", content: buildCompletedPlansReadme() },
    { path: "logs/codex/active/README.md", content: buildActiveLogsReadme() },
    { path: "logs/codex/completed/README.md", content: buildCompletedLogsReadme() },
    ...buildAgentAdminRunbooks(config),
    ...buildAgentAdminTruthSourceFiles(config),
  ];

  for (const role of config.roles) {
    files.push({
      path: joinPath(config.paths.codexAgentsDir, `${role.key}.toml`),
      content: buildRoleToml(role),
    });
  }

  for (const [path, content] of Object.entries(buildAgentAdminMemoryFiles())) {
    files.push({ path, content });
  }

  if (config.devCommand) {
    files.push({
      path: config.paths.codexEnvironmentFile,
      content: buildEnvironmentToml(config.projectName, config.devCommand),
    });
  }

  return files;
}

const presetMap = new Map<string, PresetDefinition>([
  [
    "generic-software",
    {
      key: "generic-software",
      defaultLanguage: "en",
      defaultProjectName: "Acme Platform",
      paths: genericPaths,
      roles: genericRoles,
      truthSources: genericTruthSources,
      includeOverrideFile: false,
      buildManagedFiles: buildGenericManagedFiles,
    },
  ],
  [
    "agentadmin-codex",
    {
      key: "agentadmin-codex",
      defaultLanguage: "zh",
      defaultProjectName: "AgentAdmin",
      paths: agentAdminPaths,
      roles: agentAdminRoles,
      truthSources: agentAdminTruthSources,
      includeOverrideFile: true,
      buildManagedFiles: buildAgentAdminManagedFiles,
    },
  ],
]);

export function getPreset(key: string): PresetDefinition {
  const preset = presetMap.get(key);
  if (!preset) {
    const available = [...presetMap.keys()].sort().join(", ");
    throw new Error(`Unknown preset "${key}". Available presets: ${available}.`);
  }

  return preset;
}
