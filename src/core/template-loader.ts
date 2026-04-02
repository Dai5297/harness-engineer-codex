import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { GeneratedFile, HarnessConfig, PresetDefinition } from "../types/harness.js";
import { renderTemplate } from "../utils/render.js";
import { listManagedTemplatePaths, resolveTemplateDirectory } from "./preset-registry.js";

export async function loadManagedTemplateFiles(
  preset: PresetDefinition,
  config: HarnessConfig,
): Promise<GeneratedFile[]> {
  const templateRoot = resolveTemplateDirectory(preset.templateDirectory);
  const relativePaths = listManagedTemplatePaths(preset);
  const templateContext = preset.buildTemplateContext(config);

  const files = await Promise.all(
    relativePaths.map(async (relativePath) => {
      const absolutePath = join(templateRoot, relativePath);
      const content = await readFile(absolutePath, "utf8");

      return {
        path: relativePath,
        content: renderTemplate(content, templateContext),
      };
    }),
  );

  return files.sort((left, right) => left.path.localeCompare(right.path));
}
