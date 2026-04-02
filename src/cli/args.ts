import type { ParsedArgs } from "../types/cli.js";
import type { HarnessLanguage, TaskClass } from "../types/harness.js";

export function parseArgs(argv: string[]): ParsedArgs {
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

    const [rawName, inlineValue] = token.slice(2).split("=", 2);
    if (!rawName) {
      continue;
    }

    if (inlineValue !== undefined) {
      options[rawName] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      options[rawName] = true;
      continue;
    }

    options[rawName] = next;
    index += 1;
  }

  return { positionals, options };
}

export function asString(value: string | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function parseHarnessLanguage(value: string | undefined): HarnessLanguage | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === "en" || value === "zh" || value === "bilingual") {
    return value;
  }

  throw new Error(`Invalid language "${value}". Use en, zh, or bilingual.`);
}

export function parseTaskClass(value: string | undefined): TaskClass {
  const candidate = value ?? "B";
  if (candidate === "A" || candidate === "B" || candidate === "C") {
    return candidate;
  }

  throw new Error(`Invalid task class "${candidate}". Use A, B, or C.`);
}
