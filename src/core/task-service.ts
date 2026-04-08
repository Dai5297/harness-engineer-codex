import { join } from "node:path";

import type { HarnessLanguage, TaskArchiveOptions, TaskNewOptions } from "../types/harness.js";
import {
  DEFAULT_ACTIVE_TASK_REQUIRED_SECTIONS,
  getActiveTaskRequiredSections,
  getCompletionSections,
} from "./template-language.js";
import { loadHarnessConfig } from "./config-service.js";
import { ensureTrailingNewline } from "../utils/format.js";
import { listMarkdownSlugs, movePath, pathExists, readTextFile, writeTextFile } from "../utils/fs.js";

export const ACTIVE_TASK_REQUIRED_SECTIONS = DEFAULT_ACTIVE_TASK_REQUIRED_SECTIONS;

const TASK_TEMPLATE_TOKENS = {
  taskSlug: "__TASK_SLUG__",
  taskClass: "__TASK_CLASS__",
  currentDate: "__CURRENT_DATE__",
  projectName: "__PROJECT_NAME__",
};

export async function createTask(options: TaskNewOptions): Promise<void> {
  assertValidTaskSlug(options.slug);

  const config = await loadHarnessConfig(options.cwd);
  const planPath = join(options.cwd, config.paths.plansActiveDir, `${options.slug}.md`);
  if (await pathExists(planPath)) {
    throw new Error(`Task "${options.slug}" already exists in active plans.`);
  }

  const planTemplate = await loadTaskPlanTemplate(options.cwd, config.paths.execPlanTemplateFile);
  const renderedPlan = renderTaskPlanTemplate(planTemplate, {
    taskSlug: options.slug,
    taskClass: options.taskClass,
    currentDate: new Date().toISOString().slice(0, 10),
    projectName: config.projectName,
  });

  await writeTextFile(planPath, renderedPlan);
}

export async function archiveTask(options: TaskArchiveOptions): Promise<void> {
  assertValidTaskSlug(options.slug);

  const config = await loadHarnessConfig(options.cwd);
  const activePlanPath = join(options.cwd, config.paths.plansActiveDir, `${options.slug}.md`);
  const completedPlanPath = join(options.cwd, config.paths.plansCompletedDir, `${options.slug}.md`);

  if (!(await pathExists(activePlanPath))) {
    throw new Error(`Task "${options.slug}" does not exist in active plans.`);
  }

  const currentPlan = await readTextFile(activePlanPath);
  const archivedPlan = ensureCompletionSections(currentPlan, config.language);

  await writeTextFile(activePlanPath, archivedPlan);
  await movePath(activePlanPath, completedPlanPath);
}

export function findMissingTaskSections(planContents: string, language: HarnessLanguage = "en"): string[] {
  return getActiveTaskRequiredSections(language).filter((section) => !planContents.includes(section));
}

function renderTaskPlanTemplate(
  template: string,
  context: {
    taskSlug: string;
    taskClass: TaskNewOptions["taskClass"];
    currentDate: string;
    projectName: string;
  },
): string {
  return ensureTrailingNewline(
    template
      .replaceAll(TASK_TEMPLATE_TOKENS.taskSlug, context.taskSlug)
      .replaceAll(TASK_TEMPLATE_TOKENS.taskClass, context.taskClass)
      .replaceAll(TASK_TEMPLATE_TOKENS.currentDate, context.currentDate)
      .replaceAll(TASK_TEMPLATE_TOKENS.projectName, context.projectName),
  );
}

async function loadTaskPlanTemplate(cwd: string, relativeTemplatePath: string): Promise<string> {
  const templatePath = join(cwd, relativeTemplatePath);
  if (await pathExists(templatePath)) {
    return readTextFile(templatePath);
  }

  return DEFAULT_TASK_TEMPLATE;
}

function ensureCompletionSections(planContents: string, language: HarnessLanguage): string {
  let next = ensureTrailingNewline(planContents).trimEnd();

  for (const section of getCompletionSections(language)) {
    if (!next.includes(section)) {
      next = `${next}\n\n${section}\n`;
    }
  }

  return ensureTrailingNewline(next);
}

function assertValidTaskSlug(slug: string): void {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error(`Invalid task slug "${slug}". Use lowercase letters, numbers, and hyphens only.`);
  }
}

const DEFAULT_TASK_TEMPLATE = `# __TASK_SLUG__

## Status

- Owner: \`__PROJECT_NAME__\`
- Status: \`active\`
- Task class: \`__TASK_CLASS__\`
- Opened on: \`__CURRENT_DATE__\`

## Goal

## Scope

## Non-goals

## Dependencies And Context

## Work Plan

## Validation Plan

## Open Questions

## Documentation Updates
`;

export async function listActivePlans(cwd: string): Promise<string[]> {
  const config = await loadHarnessConfig(cwd);
  return listMarkdownSlugs(join(cwd, config.paths.plansActiveDir));
}

export async function hasActivePlans(cwd: string): Promise<boolean> {
  const plans = await listActivePlans(cwd);
  return plans.length > 0;
}
