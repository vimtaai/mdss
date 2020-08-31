import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export function scriptDir() {
  return dirname(fileURLToPath(import.meta.url));
}

export const mdssSourcePath = resolve(scriptDir(), "..", "..");
export const configFilePath = resolve("mdss.json");
export const defaultConfigPath = "mdss/config";
export const defaultOutputPath = "mdss/build";
