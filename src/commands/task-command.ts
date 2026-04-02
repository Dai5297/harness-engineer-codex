import type { CliIo } from "../types/cli.js";
import { parseArgs, asString, parseTaskClass } from "../cli/args.js";
import { archiveTask, createTask } from "../core/task-service.js";

export async function runTaskCommand(argv: string[], cwd: string, io: CliIo): Promise<number> {
  const [subcommand, ...rest] = argv;

  if (subcommand === "new") {
    const { positionals, options } = parseArgs(rest);
    const slug = positionals[0];
    if (!slug) {
      throw new Error("task new requires a <slug>.");
    }

    await createTask({
      cwd,
      slug,
      taskClass: parseTaskClass(asString(options.class)),
    });
    await io.write(`Created task "${slug}".`);
    return 0;
  }

  if (subcommand === "archive") {
    const { positionals } = parseArgs(rest);
    const slug = positionals[0];
    if (!slug) {
      throw new Error("task archive requires a <slug>.");
    }

    await archiveTask({ cwd, slug });
    await io.write(`Archived task "${slug}".`);
    return 0;
  }

  throw new Error(`Unknown task subcommand "${subcommand ?? ""}".`);
}
