import { chmod, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function createFakeCodexBinary(
  dir: string,
  options?: {
    argsFile?: string;
    promptFile?: string;
    architectureContent?: string;
    exitCode?: number;
    lastMessage?: string;
    stderr?: string;
    stdout?: string;
    versionOutput?: string;
  },
): Promise<string> {
  const scriptPath = join(dir, "fake-codex.mjs");
  const script = `#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const options = ${JSON.stringify({
    argsFile: options?.argsFile,
    promptFile: options?.promptFile,
    architectureContent: options?.architectureContent ?? "# Fake Codex Architecture",
    exitCode: options?.exitCode ?? 0,
    lastMessage: options?.lastMessage ?? "Fake codex completed",
    stderr: options?.stderr ?? "",
    stdout: options?.stdout ?? "fake codex stdout\\n",
    versionOutput: options?.versionOutput ?? "codex 0.0.0-test",
  })};

const args = process.argv.slice(2);

if (args[0] === "--version") {
  process.stdout.write(\`\${options.versionOutput}\\n\`);
  process.exit(0);
}

let targetDir = "";
let outputLastMessage = "";

for (let index = 0; index < args.length; index += 1) {
  const token = args[index];
  if (token === "-C") {
    targetDir = args[index + 1] ?? "";
    index += 1;
    continue;
  }

  if (token === "-o" || token === "--output-last-message") {
    outputLastMessage = args[index + 1] ?? "";
    index += 1;
  }
}

const stdinChunks = [];
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => stdinChunks.push(chunk));
process.stdin.on("end", () => {
  if (options.argsFile) {
    writeFileSync(options.argsFile, JSON.stringify(args, null, 2));
  }

  if (options.promptFile) {
    writeFileSync(options.promptFile, stdinChunks.join(""));
  }

  if (targetDir) {
    writeFileSync(join(targetDir, "ARCHITECTURE.md"), \`\${options.architectureContent}\\n\`);
  }

  if (outputLastMessage) {
    writeFileSync(outputLastMessage, \`\${options.lastMessage}\\n\`);
  }

  if (options.stdout) {
    process.stdout.write(options.stdout);
  }

  if (options.stderr) {
    process.stderr.write(options.stderr);
  }

  process.exit(options.exitCode);
});
`;

  await writeFile(scriptPath, script, "utf8");
  await chmod(scriptPath, 0o755);
  return scriptPath;
}
