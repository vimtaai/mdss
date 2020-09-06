#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";

import { resolve } from "path";

import { defaultConfigFile, defaultConfigDir, defaultOutputDir } from "./helpers/constants.js";
import { mdssConfigDir } from "./helpers/mdss-paths.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "mdss", interactive: true });

program
  .option("-f --config-file <path>", "set config file path")
  .option("-c --config-path <path>", "set config dir path")
  .option("-o --output-path <path>", "set output dir path")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function customize(program) {
  if (program.quiet) {
    logger.disable();
  }

  const configFile = program.configFile || defaultConfigFile;
  const configDir = program.configPath || defaultConfigDir;
  const outputDir = program.outputPath || defaultOutputDir;
  const isConfigDirCustom = configDir !== defaultConfigDir;
  const isOutputDirCustom = outputDir !== defaultOutputDir;

  try {
    logger.await(`Checking for old config file \`${configFile}\`...`);
    const localConfigFileExists = await FsExtra.pathExists(defaultConfigFile);

    if (localConfigFileExists) {
      logger.await(`Deleting old config file \`${configFile}\`...`);

      await FsExtra.unlink(defaultConfigFile);
    }
  } catch (err) {
    logger.error(`Could not delete config file \`${configFile}\`.\n`, err);
    return;
  }

  try {
    if (isConfigDirCustom || isOutputDirCustom) {
      logger.await(`Creating new config file \`${configFile}\`...`);
      const configFileData = {
        configPath: configDir,
        outputPath: outputDir,
      };
      const configFileContents = JSON.stringify(configFileData, null, 2);

      await FsExtra.writeFile(defaultConfigFile, configFileContents);
      logger.success(`Created ${defaultConfigFile}\n`);
    }
  } catch (err) {
    logger.error(`Could not create config file \`${configFile}\`.`, err);
    return;
  }

  try {
    logger.await(`Creating config dir \`${configDir}\`...`);
    await FsExtra.ensureDir(resolve(configDir));
  } catch (err) {
    logger.error(`Could not create config/output dir.\n`, err);
    return;
  }

  try {
    logger.await(`Creating output dir \`${outputDir}\`...`);
    await FsExtra.ensureDir(resolve(outputDir));
  } catch (err) {
    logger.error(`Could not create config/output dir.\n`, err);
    return;
  }

  try {
    logger.await(`Getting list of config files...`);
    const configFileList = await FsExtra.readdir(mdssConfigDir);

    for (const configFile of configFileList) {
      logger.await(`Copying ${configFile}...`);

      const configFileFrom = resolve(mdssConfigDir, configFile);
      const configFileTo = resolve(configDir, configFile);

      await FsExtra.copy(configFileFrom, configFileTo);
      logger.success(`Copied ${configFile}\n`);
    }
  } catch (err) {
    logger.error(`Could not copy config files.\n`, err);
    return;
  }
}

customize(program);
