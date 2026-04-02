export type HarnessLanguage = "en" | "zh" | "bilingual";
export type TemplateLocale = "en" | "zh";

export type TaskClass = "A" | "B" | "C";

export type WorkspaceKind = "empty" | "existing" | "scaffolded";

export type ManagedWriteMode = "create-missing" | "force-managed";

export interface HarnessPathsConfig {
  docsRoot: string;
  designDocsDir: string;
  productSpecsDir: string;
  generatedDocsDir: string;
  referencesDir: string;
  execPlansDir: string;
  plansActiveDir: string;
  plansCompletedDir: string;
  execPlanTemplateFile: string;
  codexDir: string;
  codexAgentsDir: string;
  codexConfigFile: string;
}

export interface HarnessRoleConfig {
  key: string;
  name: string;
  purpose: string;
  owns: string[];
  outputs: string[];
}

export type TemplateContextValue = string | number | boolean | string[];

export type TemplateContext = Record<string, TemplateContextValue>;

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface HarnessConfig {
  projectName: string;
  preset: string;
  language: HarnessLanguage;
  version: number;
  paths: HarnessPathsConfig;
  roles: HarnessRoleConfig[];
  managedFiles: string[];
}

export interface BuildConfigOptions {
  cwd: string;
  targetDir?: string;
  projectName: string;
  presetKey: string;
  language?: HarnessLanguage;
}

export interface InitOptions {
  cwd: string;
  targetDir?: string;
  projectName?: string;
  preset?: string;
  language?: HarnessLanguage;
  yes?: boolean;
  force?: boolean;
  dryRun?: boolean;
  packageVersion?: string;
}

export interface InitResult {
  targetDir: string;
  createdFiles: string[];
  skippedFiles: string[];
  overwrittenFiles: string[];
  dryRun: boolean;
}

export interface EnrichOptions {
  cwd: string;
  targetDir?: string;
  projectName?: string;
  preset?: string;
  language?: HarnessLanguage;
  yes?: boolean;
  force?: boolean;
  dryRun?: boolean;
  packageVersion?: string;
  codexCommand?: string;
  codexEnv?: NodeJS.ProcessEnv;
}

export interface CodexAvailabilityResult {
  available: boolean;
  command: string;
  reason?: string;
  suggestedNextStep: string;
}

export interface CodexExecOptions {
  cwd: string;
  prompt: string;
  command?: string;
  env?: NodeJS.ProcessEnv;
}

export interface CodexRunResult {
  command: string;
  args: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  lastMessage?: string;
}

export interface EnrichResult extends InitResult {
  workspaceKind: WorkspaceKind;
  codex: CodexRunResult | null;
}

export interface TaskNewOptions {
  cwd: string;
  slug: string;
  taskClass: TaskClass;
}

export interface TaskArchiveOptions {
  cwd: string;
  slug: string;
}

export interface StatusResult {
  configPath: string;
  activeTasks: string[];
  missingManagedFiles: string[];
  driftedManagedFiles: string[];
  inconsistentTasks: Array<{
    slug: string;
    missing: string[];
  }>;
}

export interface PresetDefinition {
  key: string;
  title: string;
  defaultLanguage: HarnessLanguage;
  defaultProjectName: string;
  templateDirectory: string;
  paths: HarnessPathsConfig;
  roles: HarnessRoleConfig[];
  buildTemplateContext(config: HarnessConfig, locale: TemplateLocale): TemplateContext;
}
