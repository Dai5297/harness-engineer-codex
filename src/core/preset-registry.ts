import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { genericSoftwarePreset } from "../presets/generic-software.js";
import type { PresetDefinition, TemplateLocale } from "../types/harness.js";
import { listFilesRecursivelySync } from "../utils/fs.js";

const presetMap = new Map<string, PresetDefinition>([
  [genericSoftwarePreset.key, genericSoftwarePreset],
]);

export function getPreset(key: string): PresetDefinition {
  const preset = presetMap.get(key);
  if (!preset) {
    const available = [...presetMap.keys()].sort().join(", ");
    throw new Error(`Unknown preset "${key}". Available presets: ${available}.`);
  }

  return preset;
}

export function resolveTemplateDirectory(templateDirectory: string): string {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  return resolve(currentDirectory, "../../templates", templateDirectory);
}

export function resolveLocalizedTemplateDirectory(templateDirectory: string, locale: TemplateLocale): string {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  return resolve(currentDirectory, "../../templates/_locales", templateDirectory, locale);
}

export function listManagedTemplatePaths(preset: PresetDefinition): string[] {
  return listFilesRecursivelySync(resolveTemplateDirectory(preset.templateDirectory));
}
