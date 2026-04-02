import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { CodexAvailabilityResult, CodexExecOptions, CodexRunResult } from "../types/harness.js";
import { pathExists } from "../utils/fs.js";

const DEFAULT_CODEX_COMMAND = "codex";

export function resolveCodexCommand(env: NodeJS.ProcessEnv = process.env, override?: string): string {
  if (override?.trim()) {
    return override.trim();
  }

  if (env.HARNESS_CODEX_BIN?.trim()) {
    return env.HARNESS_CODEX_BIN.trim();
  }

  return DEFAULT_CODEX_COMMAND;
}

export async function checkCodexAvailability(
  command = DEFAULT_CODEX_COMMAND,
  env: NodeJS.ProcessEnv = process.env,
): Promise<CodexAvailabilityResult> {
  try {
    const exitCode = await runCommand(command, ["--version"], "", env);
    if (exitCode === 0) {
      return {
        available: true,
        command,
        suggestedNextStep: "Run `codex login` if the CLI is installed but not authenticated yet.",
      };
    }

    return {
      available: false,
      command,
      reason: `The Codex CLI exited with status ${exitCode} during the availability check.`,
      suggestedNextStep: "Install or repair the Codex CLI, then run `codex login` before retrying `harness enrich`.",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      available: false,
      command,
      reason,
      suggestedNextStep: "Install the Codex CLI, make sure `codex` is on PATH, then run `codex login` before retrying `harness enrich`.",
    };
  }
}

export async function runCodexExec(options: CodexExecOptions): Promise<CodexRunResult> {
  const command = resolveCodexCommand(options.env, options.command);
  const tempDir = await mkdtemp(join(tmpdir(), "harness-codex-"));
  const lastMessagePath = join(tempDir, "last-message.txt");
  const args = [
    "exec",
    "-C",
    options.cwd,
    "--skip-git-repo-check",
    "--full-auto",
    "-o",
    lastMessagePath,
  ];

  try {
    const result = await spawnCommand(command, args, options.prompt, options.env);
    const lastMessage = await readOptionalText(lastMessagePath);

    return {
      command,
      args,
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      lastMessage,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function runCommand(
  command: string,
  args: string[],
  stdin: string,
  env: NodeJS.ProcessEnv,
): Promise<number> {
  const result = await spawnCommand(command, args, stdin, env);
  return result.exitCode;
}

async function spawnCommand(
  command: string,
  args: string[],
  stdin: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr,
      });
    });

    child.stdin.end(stdin);
  });
}

async function readOptionalText(filePath: string): Promise<string | undefined> {
  if (!(await pathExists(filePath))) {
    return undefined;
  }

  return readFile(filePath, "utf8");
}
