import type { CliIo } from "../types/cli.js";
import { createProcessIo } from "./io.js";
import { runEnrichCommand } from "../commands/enrich-command.js";
import { runInitCommand } from "../commands/init-command.js";
import { runStartCommand } from "../commands/start-command.js";
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

  if (command === "enrich") {
    return runEnrichCommand(rest, cwd, io);
  }

  if (command === "task") {
    return runTaskCommand(rest, cwd, io);
  }

  if (command === "status") {
    return runStatusCommand(cwd, io);
  }

  if (command === "start") {
    return runStartCommand(cwd, io);
  }

  throw new Error(`Unknown command "${command}".`);
}

function buildUsage(): string {
  return [
    "Usage:",
    "  harness init [dir] [--project-name <name>] [--preset <preset>] [--language <en|zh|bilingual>] [--force] [--yes] [--dry-run]",
    "  harness enrich [dir] [--project-name <name>] [--preset <preset>] [--language <en|zh|bilingual>] [--force] [--yes] [--dry-run]",
    "  harness start",
    "  harness task new <slug> --class <A|B|C>",
    "  harness task archive <slug>",
    "  harness status",
    "  harness --version",
  ].join("\n");
}
