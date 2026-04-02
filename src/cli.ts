#!/usr/bin/env node

import { initProject } from "./init.js";
import { readOwnPackageVersion } from "./config.js";
import { getStatus } from "./status.js";
import { archiveTask, createTask } from "./tasks.js";
import type { HarnessLanguage, TaskClass } from "./types.js";

export async function runCli(argv: string[], cwd = process.cwd()): Promise<number> {
  const [command, ...rest] = argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    writeStdout(buildUsage());
    return 0;
  }

  if (command === "init") {
    const { positionals, options } = parseArgs(rest);
    const targetDir = positionals[0] ?? ".";
    const projectName = asRequiredString(options["project-name"], "--project-name is required.");
    const preset = asString(options.preset) ?? "generic-software";
    const language = asString(options.language) as HarnessLanguage | undefined;
    const force = Boolean(options.force);
    const devCommand = asString(options["dev-command"]);
    const packageVersion = await readOwnPackageVersion(import.meta.url);

    const result = await initProject({
      cwd,
      targetDir,
      projectName,
      preset,
      language,
      yes: Boolean(options.yes),
      force,
      devCommand,
      packageVersion,
    });

    writeStdout(`Initialized ${result.targetDir}`);
    writeStdout(`Created: ${result.createdFiles.length}`);
    writeStdout(`Skipped: ${result.skippedFiles.length}`);
    writeStdout(`Overwritten: ${result.overwrittenFiles.length}`);
    return 0;
  }

  if (command === "task") {
    const [subcommand, ...taskArgs] = rest;
    if (subcommand === "new") {
      const { positionals, options } = parseArgs(taskArgs);
      const slug = positionals[0];
      if (!slug) {
        throw new Error("task new requires a <slug>.");
      }
      const taskClass = (asString(options.class) ?? "B") as TaskClass;
      validateTaskClass(taskClass);
      await createTask({
        cwd,
        slug,
        taskClass,
      });
      writeStdout(`Created task "${slug}".`);
      return 0;
    }

    if (subcommand === "archive") {
      const { positionals } = parseArgs(taskArgs);
      const slug = positionals[0];
      if (!slug) {
        throw new Error("task archive requires a <slug>.");
      }
      await archiveTask({ cwd, slug });
      writeStdout(`Archived task "${slug}".`);
      return 0;
    }

    throw new Error(`Unknown task subcommand "${subcommand ?? ""}".`);
  }

  if (command === "status") {
    const status = await getStatus(cwd);
    writeStdout(`Config: ${status.configPath}`);
    writeStdout(`Active tasks: ${status.activeTasks.length === 0 ? "none" : status.activeTasks.join(", ")}`);
    writeStdout(`Missing managed files: ${status.missingManagedFiles.length}`);
    writeStdout(`Drifted managed files: ${status.driftedManagedFiles.length}`);
    writeStdout(`Inconsistent tasks: ${status.inconsistentTasks.length}`);
    return 0;
  }

  throw new Error(`Unknown command "${command}".`);
}

function buildUsage(): string {
  return [
    "Usage:",
    "  harness-engineer init [dir] --preset <preset> --project-name <name> [--yes] [--force] [--dev-command <cmd>] [--language <en|zh>]",
    "  harness-engineer task new <slug> --class <A|B|C>",
    "  harness-engineer task archive <slug>",
    "  harness-engineer status",
  ].join("\n");
}

function parseArgs(argv: string[]): {
  positionals: string[];
  options: Record<string, string | boolean>;
} {
  const positionals: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token) {
      continue;
    }
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }
    const optionName = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      options[optionName] = true;
      continue;
    }
    options[optionName] = next;
    index += 1;
  }

  return { positionals, options };
}

function asString(value: string | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asRequiredString(value: string | boolean | undefined, errorMessage: string): string {
  const stringValue = asString(value);
  if (!stringValue) {
    throw new Error(errorMessage);
  }
  return stringValue;
}

function validateTaskClass(taskClass: string): asserts taskClass is TaskClass {
  if (!["A", "B", "C"].includes(taskClass)) {
    throw new Error(`Invalid task class "${taskClass}". Use A, B, or C.`);
  }
}

function writeStdout(message: string): void {
  process.stdout.write(`${message}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli(process.argv.slice(2)).then(
    (exitCode) => {
      process.exitCode = exitCode;
    },
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
    },
  );
}
