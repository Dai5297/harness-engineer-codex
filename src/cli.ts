#!/usr/bin/env node

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

export { runCli } from "./cli/run.js";

if (isExecutedAsScript(import.meta.url, process.argv[1])) {
  const { runCli } = await import("./cli/run.js");

  runCli(process.argv.slice(2)).then(
    (exitCode) => {
      process.exitCode = exitCode;
    },
    async (error: unknown) => {
      const { createProcessIo } = await import("./cli/io.js");
      const io = createProcessIo();
      const message = error instanceof Error ? error.message : String(error);
      await io.writeError(message);
      process.exitCode = 1;
    },
  );
}

function isExecutedAsScript(moduleUrl: string, argv1: string | undefined): boolean {
  if (!argv1) {
    return false;
  }

  try {
    return realpathSync(fileURLToPath(moduleUrl)) === realpathSync(argv1);
  } catch {
    return false;
  }
}
