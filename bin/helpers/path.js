import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export function scriptDir() {
  return dirname(fileURLToPath(import.meta.url));
}

export const defaultConfigDir = "mdss/config";
export const defaultOutputDir = "mdss/build";
export const localConfigFile = "mdss.json";
export const mdssSourceDir = resolve(scriptDir(), "..", "..");
export const mdssConfigDir = resolve(mdssSourceDir, "src", "config");
