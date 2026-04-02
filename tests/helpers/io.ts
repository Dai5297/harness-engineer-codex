import type { CliIo } from "../../src/types.js";

export function createTestIo(options?: {
  confirmResult?: boolean;
  interactive?: boolean;
}): {
  io: CliIo;
  output: string[];
  errors: string[];
} {
  const output: string[] = [];
  const errors: string[] = [];

  return {
    io: {
      write(message) {
        output.push(message);
      },
      writeError(message) {
        errors.push(message);
      },
      async confirm() {
        return options?.confirmResult ?? true;
      },
      isInteractive() {
        return options?.interactive ?? true;
      },
    },
    output,
    errors,
  };
}
