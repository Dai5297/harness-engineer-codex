import type { HarnessLanguage, TemplateLocale } from "../types/harness.js";

const ACTIVE_TASK_SECTION_LABELS = {
  en: [
    "## Status",
    "## Goal",
    "## Scope",
    "## Work Plan",
    "## Validation Plan",
  ],
  zh: [
    "## 状态",
    "## 目标",
    "## 范围",
    "## 工作计划",
    "## 验证计划",
  ],
} as const;

const COMPLETION_SECTION_LABELS = {
  en: [
    "## Result",
    "## Actual Changes",
    "## Verified",
    "## Unverified",
    "## Residual Risks",
    "## Follow-Up",
  ],
  zh: [
    "## 结果",
    "## 实际变更",
    "## 已验证",
    "## 未验证",
    "## 剩余风险",
    "## 后续事项",
  ],
} as const;

export const DEFAULT_ACTIVE_TASK_REQUIRED_SECTIONS = [...ACTIVE_TASK_SECTION_LABELS.en];

export function resolveTemplateLocales(language: HarnessLanguage): TemplateLocale[] {
  if (language === "zh") {
    return ["zh"];
  }

  if (language === "bilingual") {
    return ["en", "zh"];
  }

  return ["en"];
}

export function resolveLanguageDisplay(language: HarnessLanguage, locale: TemplateLocale): string {
  if (locale === "zh") {
    if (language === "en") {
      return "英文";
    }
    if (language === "zh") {
      return "中文";
    }

    return "中英双语";
  }

  if (language === "en") {
    return "English";
  }
  if (language === "zh") {
    return "Chinese";
  }

  return "Bilingual (English + Chinese)";
}

export function isMarkdownTemplatePath(relativePath: string): boolean {
  return relativePath.endsWith(".md");
}

export function composeBilingualMarkdown(english: string, chinese: string): string {
  return [
    "<!-- Generated in bilingual mode: English first, 中文 second. -->",
    "",
    "## English",
    "",
    english.trim(),
    "",
    "---",
    "",
    "## 中文",
    "",
    chinese.trim(),
    "",
  ].join("\n");
}

export function getActiveTaskRequiredSections(language: HarnessLanguage): string[] {
  if (language === "zh") {
    return [...ACTIVE_TASK_SECTION_LABELS.zh];
  }

  return [...ACTIVE_TASK_SECTION_LABELS.en];
}

export function getCompletionSections(language: HarnessLanguage): string[] {
  if (language === "zh") {
    return [...COMPLETION_SECTION_LABELS.zh];
  }

  if (language === "bilingual") {
    return [...COMPLETION_SECTION_LABELS.en, ...COMPLETION_SECTION_LABELS.zh];
  }

  return [...COMPLETION_SECTION_LABELS.en];
}
