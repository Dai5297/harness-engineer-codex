export type HarnessLanguage = "en" | "zh";

export type TaskClass = "A" | "B" | "C";

export interface HarnessPathsConfig {
  docsRoot: string;
  sourceOfTruthDir: string;
  runbooksDir: string;
  plansActiveDir: string;
  plansCompletedDir: string;
  logsActiveDir: string;
  logsCompletedDir: string;
  codexDir: string;
  codexAgentsDir: string;
  codexMemoryDir: string;
  codexEnvironmentFile: string;
}

export interface HarnessRoleConfig {
  key: string;
  name: string;
  purpose: string;
  model: string;
  reasoningEffort: "low" | "medium" | "high" | "xhigh";
  runbookFile: string;
  memoryFile: string;
  handoffPathHint: string;
  readFirst: string[];
  scope: string[];
  doNot: string[];
  handoffRequired: string[];
  defaultOutput: string[];
}

export interface TruthSourceConfig {
  key: string;
  path: string;
  title: string;
  summary: string;
}

export interface HarnessConfig {
  projectName: string;
  preset: string;
  language: HarnessLanguage;
  version: number;
  devCommand: string | null;
  paths: HarnessPathsConfig;
  roles: HarnessRoleConfig[];
  truthSources: TruthSourceConfig[];
  managedFiles: string[];
}

export interface InitOptions {
  cwd: string;
  targetDir?: string;
  projectName: string;
  preset: string;
  language?: HarnessLanguage;
  yes?: boolean;
  force?: boolean;
  devCommand?: string;
  packageVersion?: string;
}

export interface InitResult {
  targetDir: string;
  createdFiles: string[];
  skippedFiles: string[];
  overwrittenFiles: string[];
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
