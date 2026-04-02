import type {
  HarnessConfig,
  HarnessPathsConfig,
  HarnessRoleConfig,
  PresetDefinition,
  TemplateLocale,
} from "../types/harness.js";
import { resolveLanguageDisplay } from "../core/template-language.js";

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

const zhRoleTranslations = [
  {
    purpose: "负责任务 framing、文档读取顺序、委派边界与收尾标准。",
    owns: [
      "任务接收、范围界定与决策记录",
      "判断哪些文档与计划需要更新",
      "在 Planner、Builder、Reviewer、Tester 之间交接工作",
    ],
    outputs: [
      "带有约束条件的清晰任务说明",
      "文档更新清单",
      "决策摘要与下一步责任人",
    ],
  },
  {
    purpose: "把目标拆成分阶段执行计划，识别依赖，并尽早暴露隐藏风险。",
    owns: [
      "把大任务拆成可增量推进的步骤",
      "识别跨文档、跨模块依赖",
      "定义验证顺序与上线节奏",
    ],
    outputs: [
      "带里程碑的执行计划",
      "风险清单与开放问题",
      "编码前应更新的文档建议",
    ],
  },
  {
    purpose: "实现最小且正确的变更，保持文档同步，避免投机式重写。",
    owns: [
      "代码改动与低风险重构",
      "当行为变化时更新架构或产品文档",
      "记录需要由下一个角色验证的假设",
    ],
    outputs: [
      "实现摘要",
      "变更文件与受影响边界",
      "给 Reviewer 和 Tester 的说明",
    ],
  },
  {
    purpose: "在工作宣告完成前，识别回归、文档漂移、风险假设与正确性缺口。",
    owns: [
      "以发现为先的行为风险审查",
      "检查文档是否仍与实现一致",
      "指出剩余风险与未验证路径",
    ],
    outputs: [
      "按优先级排序的问题清单",
      "文档漂移或遗漏提示",
      "剩余风险摘要",
    ],
  },
  {
    purpose: "定义并执行验证矩阵，然后明确报告哪些已验证、哪些仍未知。",
    owns: [
      "单测、集成与工作流验证规划",
      "收集手动与自动化验证证据",
      "清晰区分已验证与未验证内容",
    ],
    outputs: [
      "验证矩阵",
      "已执行检查与结果",
      "尚未覆盖的测试缺口与发布阻塞项",
    ],
  },
] satisfies Array<Pick<HarnessRoleConfig, "purpose" | "owns" | "outputs">>;

const localizedCopy = {
  en: {
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
  },
  zh: {
    subagentUsage: [
      "项目级自定义 agent 放在 `.codex/agents/` 下，用于显式 subagent 委派。",
      "使用 `.codex/config.toml` 把 `max_threads`、`max_depth` 这类 `[agents]` 运行参数与仓库一起维护。",
      "每个自定义 agent 都应保持职责单一、观点明确，并聚焦一个主要责任。",
      "规划与评审优先使用只读 agent；只有在明确要实现代码时才使用可写 agent。",
    ],
    collaborationSequence: [
      "在规划实现前先阅读 `AGENTS.override.md`、`ARCHITECTURE.md` 与 `docs/index.md`。",
      "只要任务跨越多个决策、多个角色或多轮评审，就应在 `docs/exec-plans/active/` 中维护执行计划。",
      "当契约、行为或约束发生变化时，要在同一变更中同步更新仓库内文档。",
      "验证高风险改动时，尽量保持 Reviewer 和 Tester 独立于 Builder。",
      "收尾前明确记录哪些已验证、哪些只是假设、哪些还需要后续跟进。",
    ],
    documentationAreas: [
      "`AGENTS.override.md` 用于记录协作规则、角色边界与文档读取顺序。",
      "`ARCHITECTURE.md` 用于记录系统地图、主要模块以及边界规则。",
      "`docs/design-docs/` 用于记录技术动机、决策留痕与跨领域设计权衡。",
      "`docs/product-specs/` 用于记录用户可感知行为、流程与验收标准。",
      "`docs/exec-plans/` 用于记录进行中与已完成的多步骤任务。",
      "`docs/generated/` 用于保存 agent 应优先引用的本地生成证据，而不是重复推导。",
      "`docs/references/` 用于沉淀稳定的外部知识、术语与重要链接。",
    ],
    architectureBoundaries: [
      "`Application` 层负责编排、工作流以及带策略的用例。",
      "`Domain` 层负责业务规则、核心词汇与应保持稳定的不变量。",
      "`Infrastructure` 层负责存储、网络、CLI、第三方 SDK 与自动化接入。",
      "`Repository documents` 负责沉淀长期决策、质量标准与 agent 可读取的项目上下文。",
    ],
    qualitySignals: [
      "清晰度：新同学能否快速找到正确的 source-of-truth 文档？",
      "正确性：实现是否仍然符合产品规格与架构约束？",
      "变更安全：计划、验证与评审证据是否覆盖了高风险路径？",
      "运行质量：可靠性与安全预期是否被文档化且可验证？",
    ],
    reliabilityChecklist: [
      "为每条用户可见工作流明确关键路径、延迟预算与主要故障模式。",
      "日志要提供足够的结构化上下文，便于在生产环境排障，而不必重放整段会话。",
      "当外部服务或自动化步骤出问题时，优先安全降级，而不是静默失败。",
      "为容易误操作或恢复成本高的流程编写运行手册。",
    ],
    securityChecklist: [
      "所有不可信输入都必须在首次进入系统的边界处校验。",
      "密钥、令牌和凭证只能作为运行时配置存在，绝不能硬编码。",
      "在交付敏感变更前，先文档化授权、审计与数据处理预期。",
      "当变更涉及认证、权限、支付或数据导出时，必须触发显式安全评审。",
    ],
  },
} as const;

function buildRoleSummary(role: HarnessRoleConfig): string {
  return `\`${role.name}\`: ${role.purpose}`;
}

function buildTemplateContext(config: HarnessConfig, locale: TemplateLocale) {
  const localizedRoles = getLocalizedRoles(locale);
  const copy = localizedCopy[locale];

  return {
    projectName: config.projectName,
    languageDisplay: resolveLanguageDisplay(config.language, locale),
    roleSummaries: localizedRoles.map(buildRoleSummary),
    roleOwnership: localizedRoles.map((role) => `\`${role.name}\`: ${role.owns.join("; ")}`),
    roleOutputs: localizedRoles.map((role) => `\`${role.name}\`: ${role.outputs.join("; ")}`),
    subagentPaths: config.roles.map((role) => `\`.codex/agents/${role.key}.toml\``),
    subagentUsage: [...copy.subagentUsage],
    collaborationSequence: [...copy.collaborationSequence],
    documentationAreas: [...copy.documentationAreas],
    architectureBoundaries: [...copy.architectureBoundaries],
    qualitySignals: [...copy.qualitySignals],
    reliabilityChecklist: [...copy.reliabilityChecklist],
    securityChecklist: [...copy.securityChecklist],
  };
}

function getLocalizedRoles(locale: TemplateLocale): HarnessRoleConfig[] {
  if (locale === "en") {
    return genericRoles.map((role) => ({
      ...role,
      owns: [...role.owns],
      outputs: [...role.outputs],
    }));
  }

  return genericRoles.map((role, index) => ({
    ...role,
    purpose: zhRoleTranslations[index]?.purpose ?? role.purpose,
    owns: [...(zhRoleTranslations[index]?.owns ?? role.owns)],
    outputs: [...(zhRoleTranslations[index]?.outputs ?? role.outputs)],
  }));
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
