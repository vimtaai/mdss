import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export function scriptDir() {
  return dirname(fileURLToPath(import.meta.url));
}

export const mdssSourceDir = resolve(scriptDir(), "..", "..", "src");
export const mdssConfigDir = resolve(mdssSourceDir, "config");
