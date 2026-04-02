#!/usr/bin/env node

export { runCli } from "./cli/run.js";

if (import.meta.url === `file://${process.argv[1]}`) {
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
