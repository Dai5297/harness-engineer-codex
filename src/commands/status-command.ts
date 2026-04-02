import type { CliIo } from "../types/cli.js";
import { getStatus } from "../core/status-service.js";

export async function runStatusCommand(cwd: string, io: CliIo): Promise<number> {
  const status = await getStatus(cwd);

  await io.write(`Config: ${status.configPath}`);
  await io.write(`Active tasks: ${status.activeTasks.length === 0 ? "none" : status.activeTasks.join(", ")}`);
  await io.write(`Managed files missing: ${status.missingManagedFiles.length}`);
  await io.write(`Managed files drifted: ${status.driftedManagedFiles.length}`);
  await io.write(`Inconsistent tasks: ${status.inconsistentTasks.length}`);

  return 0;
}
