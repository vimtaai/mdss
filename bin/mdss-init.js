#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";

import { resolve } from "path";

import { defaultThemeDir, defaultOutputDir, defaultConfigFile } from "./helpers/constants.js";
import { mdssThemeDir } from "./helpers/mdss-paths.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "mdss", interactive: true });

program
  .option("-c --config-file <path>", "set config file path")
  .option("-t --theme-dir <path>", "set theme directory path")
  .option("-o --output-dir <path>", "set output directory path")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function init(program) {
  if (program.quiet) {
    logger.disable();
  }

  const configFile = program.configFile || defaultConfigFile;
  const themeDir = program.themeDir || defaultThemeDir;
  const outputDir = program.outputDir || defaultOutputDir;
  const isThemeDirCustom = themeDir !== defaultThemeDir;
  const isOutputDirCustom = outputDir !== defaultOutputDir;

  try {
    logger.await(`Checking for old config file \`${configFile}\`...`);
    const configFileExists = await FsExtra.pathExists(configFile);

    if (configFileExists) {
      logger.await(`Deleting old config file \`${configFile}\`...`);
      await FsExtra.unlink(configFile);
    }
  } catch (err) {
    logger.error(`Could not delete config file \`${configFile}\`.\n`, err);
    return;
  }

  try {
    if (isThemeDirCustom || isOutputDirCustom) {
      logger.await(`Creating new config file \`${configFile}\`...`);
      const configFileData = { themeDir, outputDir };
      const configFileContents = JSON.stringify(configFileData, null, 2);

      await FsExtra.writeFile(configFile, configFileContents);
      logger.success(`Created ${defaultConfigFile}\n`);
    }
  } catch (err) {
    logger.error(`Could not create config file \`${configFile}\`.`, err);
    return;
  }

  try {
    logger.await(`Creating theme dir \`${themeDir}\`...`);
    await FsExtra.ensureDir(resolve(themeDir));
  } catch (err) {
    logger.error(`Could not create theme dir \`${themeDir}\`.\n`, err);
    return;
  }

  try {
    logger.await(`Creating output dir \`${outputDir}\`...`);
    await FsExtra.ensureDir(resolve(outputDir));
  } catch (err) {
    logger.error(`Could not create output dir.\n`, err);
    return;
  }

  try {
    logger.await(`Getting list of theme files...`);
    const themeFileList = await FsExtra.readdir(mdssThemeDir);

    for (const themeFile of themeFileList) {
      logger.await(`Copying ${themeFile}...`);
      const themeFileFrom = resolve(mdssThemeDir, themeFile);
      const themeFileTo = resolve(themeDir, themeFile);

      await FsExtra.copy(themeFileFrom, themeFileTo);
      logger.success(`Copied ${themeFile}\n`);
    }
  } catch (err) {
    logger.error(`Could not copy theme files.\n`, err);
    return;
  }
}

init(program);
