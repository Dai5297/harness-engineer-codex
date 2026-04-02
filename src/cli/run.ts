import type { CliIo } from "../types/cli.js";
import { createProcessIo } from "./io.js";
import { runInitCommand } from "../commands/init-command.js";
import { runStatusCommand } from "../commands/status-command.js";
import { runTaskCommand } from "../commands/task-command.js";
import { readOwnPackageVersion } from "../core/config-service.js";

export async function runCli(
  argv: string[],
  cwd = process.cwd(),
  io: CliIo = createProcessIo(),
): Promise<number> {
  const [command, ...rest] = argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    await io.write(buildUsage());
    return 0;
  }

  if (command === "version" || command === "--version" || command === "-v") {
    await io.write(await readOwnPackageVersion(import.meta.url));
    return 0;
  }

  if (command === "init") {
    return runInitCommand(rest, cwd, io);
  }

  if (command === "task") {
    return runTaskCommand(rest, cwd, io);
  }

  if (command === "status") {
    return runStatusCommand(cwd, io);
  }

  throw new Error(`Unknown command "${command}".`);
}

function buildUsage(): string {
  return [
    "Usage:",
    "  harness-engineer init [dir] [--project-name <name>] [--preset <preset>] [--language <en|zh|bilingual>] [--force] [--yes] [--dry-run]",
    "  harness-engineer task new <slug> --class <A|B|C>",
    "  harness-engineer task archive <slug>",
    "  harness-engineer status",
    "  harness-engineer --version",
  ].join("\n");
}
