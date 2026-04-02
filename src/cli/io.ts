import { createInterface } from "node:readline/promises";
import process from "node:process";

import type { CliIo } from "../types/cli.js";

export function createProcessIo(): CliIo {
  return {
    write(message) {
      process.stdout.write(`${message}\n`);
    },
    writeError(message) {
      process.stderr.write(`${message}\n`);
    },
    async confirm(question, defaultValue = false) {
      const suffix = defaultValue ? " [Y/n] " : " [y/N] ";
      const readline = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      try {
        const answer = (await readline.question(`${question}${suffix}`)).trim().toLowerCase();
        if (answer.length === 0) {
          return defaultValue;
        }

        return answer === "y" || answer === "yes";
      } finally {
        readline.close();
      }
    },
    isInteractive() {
      return Boolean(process.stdin.isTTY && process.stdout.isTTY);
    },
  };
}
