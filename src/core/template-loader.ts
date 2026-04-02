import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { GeneratedFile, HarnessConfig, PresetDefinition } from "../types/harness.js";
import {
  composeBilingualMarkdown,
  isMarkdownTemplatePath,
  resolveTemplateLocales,
} from "./template-language.js";
import { renderTemplate } from "../utils/render.js";
import { pathExists } from "../utils/fs.js";
import {
  listManagedTemplatePaths,
  resolveLocalizedTemplateDirectory,
  resolveTemplateDirectory,
} from "./preset-registry.js";

export async function loadManagedTemplateFiles(
  preset: PresetDefinition,
  config: HarnessConfig,
): Promise<GeneratedFile[]> {
  const templateRoot = resolveTemplateDirectory(preset.templateDirectory);
  const relativePaths = listManagedTemplatePaths(preset);

  const files = await Promise.all(
    relativePaths.map(async (relativePath) => {
      const content = await loadTemplateContent({
        preset,
        config,
        templateRoot,
        relativePath,
      });

      return {
        path: relativePath,
        content,
      };
    }),
  );

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function loadTemplateContent(options: {
  preset: PresetDefinition;
  config: HarnessConfig;
  templateRoot: string;
  relativePath: string;
}): Promise<string> {
  const { preset, config, templateRoot, relativePath } = options;
  const englishTemplate = await readFile(join(templateRoot, relativePath), "utf8");

  if (!isMarkdownTemplatePath(relativePath)) {
    return renderTemplate(englishTemplate, preset.buildTemplateContext(config, "en"));
  }

  const locales = resolveTemplateLocales(config.language);
  if (locales.length === 1) {
    const locale = locales[0];
    if (!locale) {
      throw new Error("Expected at least one template locale.");
    }

    const template = locale === "en"
      ? englishTemplate
      : await loadLocalizedTemplate(preset.templateDirectory, relativePath, englishTemplate, locale);
    return renderTemplate(template, preset.buildTemplateContext(config, locale));
  }

  const chineseTemplate = await loadLocalizedTemplate(
    preset.templateDirectory,
    relativePath,
    englishTemplate,
    "zh",
  );
  const english = renderTemplate(englishTemplate, preset.buildTemplateContext(config, "en"));
  const chinese = renderTemplate(chineseTemplate, preset.buildTemplateContext(config, "zh"));
  return composeBilingualMarkdown(english, chinese);
}

async function loadLocalizedTemplate(
  templateDirectory: string,
  relativePath: string,
  fallback: string,
  locale: "zh",
): Promise<string> {
  const localizedRoot = resolveLocalizedTemplateDirectory(templateDirectory, locale);
  const localizedPath = join(localizedRoot, relativePath);
  if (!(await pathExists(localizedPath))) {
    return fallback;
  }

  return readFile(localizedPath, "utf8");
}
