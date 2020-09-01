#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";

import { resolve } from "path";

import {
  mdssConfigDir,
  localConfigFile,
  defaultConfigDir,
  defaultOutputDir,
} from "./helpers/path.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "mdss", interactive: true });

program
  .option("-c --config-path <dir>", "set config dir path")
  .option("-o --output-path <dir>", "set output dir path")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function customize(program) {
  if (program.quiet) {
    logger.disable();
  }

  const localConfigDir = program.configPath || defaultConfigDir;
  const localOutputDir = program.outputPath || defaultOutputDir;
  const hasCustomConfigDir = localConfigDir !== defaultConfigDir;
  const hasCustomOutputDir = localOutputDir !== defaultOutputDir;

  let configFileList = [];

  try {
    logger.await(`Checking for old config file (mdss.json)...`);

    const localConfigFileExists = await FsExtra.pathExists(localConfigFile);

    if (localConfigFileExists) {
      logger.await(`Deleting old config file (mdss.json)...`);

      await FsExtra.unlink(localConfigFile);
    }
  } catch {
    logger.error(`Could not delete config file (mdss.json).`);
    return;
  }

  try {
    if (hasCustomConfigDir || hasCustomOutputDir) {
      logger.await(`Creating new config file (mdss.json)...`);

      const configFileData = {
        configPath: localConfigDir,
        outputPath: localOutputDir,
      };
      const configFileContents = JSON.stringify(configFileData, null, 2);

      await FsExtra.writeFile(localConfigFile, configFileContents);
      logger.success(`Created ${localConfigFile}\n`);
    }
  } catch {
    logger.error(`Could not create config file (mdss.json)`);
    return;
  }

  try {
    logger.await(`Creating config/output dir...`);

    await FsExtra.ensureDir(resolve(localConfigDir));
    await FsExtra.ensureDir(resolve(localOutputDir));
  } catch {
    logger.error(`Could not create config/output dir.`);
    return;
  }

  try {
    configFileList = await FsExtra.readdir(mdssConfigDir);
  } catch {
    logger.error(`Could not get the list of config files.`);
  }

  try {
    for (const configFile of configFileList) {
      logger.await(`Copying ${configFile}...`);

      const configFileFrom = resolve(mdssConfigDir, configFile);
      const configFileTo = resolve(localConfigDir, configFile);

      await FsExtra.copy(configFileFrom, configFileTo);
      logger.success(`Copied ${configFile}\n`);
    }
  } catch (err) {
    logger.error(`Could not copy config files.`);
    return;
  }
}

customize(program);
