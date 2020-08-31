#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";

import { join, resolve } from "path";

import {
  mdssSourcePath,
  configFilePath,
  defaultConfigPath,
  defaultOutputPath,
} from "./helpers/path.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "mdss build", interactive: true });

program
  .option("-c --config-path <dir>", "set config dir path", defaultConfigPath)
  .option("-o --output-path <dir>", "set output dir path", defaultOutputPath)
  .parse(process.argv);

async function customize(program) {
  console.log(`Setting up MDSS for customization...\n`);

  // Command line options
  const options = {
    configPath: program.configPath,
    outputPath: program.outputPath,
  };

  // Customizing
  try {
    await FsExtra.pathExists(configFilePath);

    console.log(`[DELETE] mdss.json`);

    await unlink(configFilePath);
  } catch (err) {}

  if (
    options.configPath !== defaultConfigPath ||
    options.outputPath !== defaultOutputPath
  ) {
    console.log(`[CREATE] mdss.json`);

    const configFileData = {
      configPath: options.configPath,
      outputPath: options.outputPath,
    };
    const configFileContents = JSON.stringify(configFileData, null, 2);
    await FsExtra.writeFile(configFilePath, configFileContents);
  }

  try {
    await FsExtra.ensureDir(resolve(options.configPath));
    await FsExtra.ensureDir(resolve(options.outputPath));
  } catch {}

  let configFiles;
  let sourceConfigPath;
  try {
    sourceConfigPath = join(mdssSourcePath, "src", "config");
    configFiles = await FsExtra.readdir(sourceConfigPath);
  } catch {}

  try {
    for (const configFile of configFiles) {
      const configFileFrom = join(sourceConfigPath, configFile);
      const configFileTo = resolve(options.configPath, configFile);

      console.log(`[CREATE] ${configFileTo}`);

      await FsExtra.copy(configFileFrom, configFileTo);
    }
  } catch (err) {
    console.log(err);
  }
}

customize(program);
