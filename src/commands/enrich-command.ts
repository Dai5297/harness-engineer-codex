import type { CliIo } from "../types/cli.js";
import { parseArgs, asString, parseHarnessLanguage } from "../cli/args.js";
import { enrichProject } from "../core/enrich-service.js";
import { inspectTargetDirectory } from "../core/workspace-service.js";

export async function runEnrichCommand(argv: string[], cwd: string, io: CliIo): Promise<number> {
  const { positionals, options } = parseArgs(argv);
  const targetDir = positionals[0] ?? ".";
  const yes = Boolean(options.yes);
  const force = Boolean(options.force);
  const dryRun = Boolean(options["dry-run"]);
  const inspection = await inspectTargetDirectory(cwd, targetDir);

  if (inspection.needsConfirmation && !yes) {
    if (!io.isInteractive()) {
      throw new Error(
        `Target directory "${targetDir}" is non-empty. Re-run with --yes to enrich an existing project.`,
      );
    }

    const confirmed = await io.confirm(
      `Target directory "${targetDir}" is not empty. Continue and update harness docs inside it?`,
      false,
    );

    if (!confirmed) {
      await io.write("Enrichment cancelled.");
      return 1;
    }
  }

  const result = await enrichProject({
    cwd,
    targetDir,
    projectName: asString(options["project-name"]),
    preset: asString(options.preset),
    language: parseHarnessLanguage(asString(options.language)),
    yes,
    force,
    dryRun,
  });

  await io.write(`${result.dryRun ? "Dry run for" : "Enriched"} ${result.targetDir}`);
  await io.write(`Workspace: ${result.workspaceKind}`);
  await io.write(`Created: ${result.createdFiles.length}`);
  await io.write(`Skipped: ${result.skippedFiles.length}`);
  await io.write(`Overwritten: ${result.overwrittenFiles.length}`);

  if (result.dryRun) {
    await io.write("Codex: skipped (dry run)");
  } else if (result.codex) {
    await io.write(`Codex: completed with exit code ${result.codex.exitCode}`);
    if (result.codex.lastMessage?.trim()) {
      await io.write(`Codex summary: ${result.codex.lastMessage.trim()}`);
    }
  }

  return 0;
}
