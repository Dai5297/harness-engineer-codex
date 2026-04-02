import type { CliIo } from "../types/cli.js";
import { parseArgs, asString, parseHarnessLanguage } from "../cli/args.js";
import { readOwnPackageVersion } from "../core/config-service.js";
import { initProject } from "../core/init-service.js";
import { inspectTargetDirectory } from "../core/workspace-service.js";
import { inferProjectName } from "../utils/format.js";

export async function runInitCommand(argv: string[], cwd: string, io: CliIo): Promise<number> {
  const { positionals, options } = parseArgs(argv);
  const targetDir = positionals[0] ?? ".";
  const preset = asString(options.preset) ?? "generic-software";
  const language = parseHarnessLanguage(asString(options.language));
  const projectName = asString(options["project-name"]) ?? inferProjectName(cwd, targetDir);
  const inspection = await inspectTargetDirectory(cwd, targetDir);
  const yes = Boolean(options.yes);
  const force = Boolean(options.force);
  const dryRun = Boolean(options["dry-run"]);

  if (inspection.needsConfirmation && !yes) {
    if (!io.isInteractive()) {
      throw new Error(
        `Target directory "${targetDir}" is non-empty. Re-run with --yes to scaffold into an existing project.`,
      );
    }

    const confirmed = await io.confirm(
      `Target directory "${targetDir}" is not empty. Continue and manage harness files inside it?`,
      false,
    );

    if (!confirmed) {
      await io.write("Initialization cancelled.");
      return 1;
    }
  }

  const packageVersion = await readOwnPackageVersion(import.meta.url);
  const result = await initProject({
    cwd,
    targetDir,
    projectName,
    preset,
    language,
    yes,
    force,
    dryRun,
    packageVersion,
  });

  await io.write(`${result.dryRun ? "Dry run for" : "Initialized"} ${result.targetDir}`);
  await io.write(`Created: ${result.createdFiles.length}`);
  await io.write(`Skipped: ${result.skippedFiles.length}`);
  await io.write(`Overwritten: ${result.overwrittenFiles.length}`);

  return 0;
}
