import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { loadHarnessConfig } from "./config.js";
import type { TaskArchiveOptions, TaskNewOptions } from "./types.js";
import { ensureDir, ensureTrailingNewline, movePath, pathExists, writeTextFile } from "./utils.js";

export async function createTask(options: TaskNewOptions): Promise<void> {
  const config = await loadHarnessConfig(options.cwd);
  const planPath = join(options.cwd, config.paths.plansActiveDir, `${options.slug}.md`);
  const runPath = join(options.cwd, config.paths.logsActiveDir, options.slug, "run.md");
  const handoffPath = join(options.cwd, config.paths.logsActiveDir, options.slug, "handoff.md");

  if (await pathExists(planPath)) {
    throw new Error(`Task "${options.slug}" already exists in active plans.`);
  }

  await ensureDir(join(options.cwd, config.paths.logsActiveDir, options.slug));
  await writeTextFile(planPath, buildPlanTemplate(options.slug, options.taskClass));
  await writeTextFile(runPath, buildRunTemplate(options.slug));
  await writeTextFile(handoffPath, buildHandoffTemplate(options.slug));
}

export async function archiveTask(options: TaskArchiveOptions): Promise<void> {
  const config = await loadHarnessConfig(options.cwd);
  const activePlanPath = join(options.cwd, config.paths.plansActiveDir, `${options.slug}.md`);
  const completedPlanPath = join(options.cwd, config.paths.plansCompletedDir, `${options.slug}.md`);
  const activeLogDir = join(options.cwd, config.paths.logsActiveDir, options.slug);
  const completedLogDir = join(options.cwd, config.paths.logsCompletedDir, options.slug);

  if (!(await pathExists(activePlanPath))) {
    throw new Error(`Task "${options.slug}" does not exist in active plans.`);
  }
  if (!(await pathExists(activeLogDir))) {
    throw new Error(`Task "${options.slug}" does not have active logs to archive.`);
  }

  const currentPlan = await readFile(activePlanPath, "utf8");
  const archivedPlan = ensureCompletionSections(currentPlan);
  await writeTextFile(activePlanPath, archivedPlan);

  await movePath(activePlanPath, completedPlanPath);
  await movePath(activeLogDir, completedLogDir);
}

function buildPlanTemplate(slug: string, taskClass: TaskNewOptions["taskClass"]): string {
  return ensureTrailingNewline(`# ${slug}

## Status

- Owner: \`main-thread\`
- Status: \`active\`
- Task class: \`${taskClass}\`
- Task slug: \`${slug}\`

## Background

## Goal

## Scope

## Out Of Scope

## Record-System Docs

## Current Decisions

## Work Breakdown

## Validation Plan

## Risks And Blockers

## Required Roles

## Required Memory Or Handoff Updates`);
}

function buildRunTemplate(slug: string): string {
  return ensureTrailingNewline(`# ${slug} Run Log

## Context

## Timeline

### Initial Setup

- Task created.

## Commands

## Verification Notes

## Open Questions`);
}

function buildHandoffTemplate(slug: string): string {
  return ensureTrailingNewline(`# ${slug} Handoff

## Current Goal

## Completed

## In Progress

## Key Files

## Key Decisions

## Risks

## Suggested Next Steps

## Suggested Next Role`);
}

function ensureCompletionSections(planContents: string): string {
  const requiredSections = [
    "## Result",
    "## Actual Changes",
    "## Verified",
    "## Unverified",
    "## Residual Risks",
    "## Follow-Up",
  ];

  let next = ensureTrailingNewline(planContents).trimEnd();
  for (const section of requiredSections) {
    if (!next.includes(section)) {
      next = `${next}\n\n${section}\n`;
    }
  }

  return ensureTrailingNewline(next);
}
