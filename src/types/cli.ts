export interface CliIo {
  write(message: string): void | Promise<void>;
  writeError(message: string): void | Promise<void>;
  confirm(question: string, defaultValue?: boolean): Promise<boolean>;
  isInteractive(): boolean;
}

export interface ParsedArgs {
  positionals: string[];
  options: Record<string, string | boolean>;
}
