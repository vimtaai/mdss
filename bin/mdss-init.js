#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";

import { resolve } from "path";

import {
  defaultConfigFile,
  defaultThemeDir,
  defaultOutputDir,
  defaultFilename,
} from "./helpers/constants.js";
import { mdssThemeDir } from "./helpers/mdss-paths.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "mdss", interactive: true });

program
  .option("-c --config-file [path]", "set config file path")
  .option("-t --theme-dir <path>", "set theme directory path")
  .option("-o --output-dir <path>", "set output directory path")
  .option("-f --filename <name>", "set base filename")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function init(program) {
  if (program.quiet) {
    logger.disable();
  }

  const isConfigFileSet = program.configFile !== undefined;
  const isThemeDirSet = program.themeDir !== undefined;
  const isOutputDirSet = program.outputDir !== undefined;
  const isFilenameSet = program.filename !== undefined;
  const isConfigFileUsed = isConfigFileSet || isThemeDirSet || isOutputDirSet;

  let configFile = typeof program.configFile === "string" ? program.configFile : defaultConfigFile;
  let themeDir = program.themeDir || defaultThemeDir;
  let outputDir = program.outputDir || defaultOutputDir;
  let filename = program.filename || defaultFilename;

  if (isConfigFileUsed) {
    logger.info(`Config file: ${configFile}\n`);
  }
  logger.info(`Theme dir:   ${themeDir}\n`);
  logger.info(`Output dir:  ${outputDir}\n`);
  logger.info(`Filename:    ${filename}\n`);

  try {
    if (isConfigFileUsed) {
      logger.await(`Writing config file \`${configFile}\`...`);
      const configFileData = { themeDir, outputDir, filename };

      await FsExtra.writeJson(configFile, configFileData, { spaces: 2 });
      logger.success(`Created \`${configFile}\`\n`);
    }
  } catch (err) {
    logger.error(`Could not write config file \`${configFile}\`.`, err);
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
    logger.error(`Could not create output dir \`${outputDir}\`.\n`, err);
    return;
  }

  try {
    logger.await(`Getting list of theme files...`);
    const themeFileList = await FsExtra.readdir(mdssThemeDir);

    for (const themeFile of themeFileList) {
      logger.await(`Copying \`${themeFile}\`...`);
      const themeFileFrom = resolve(mdssThemeDir, themeFile);
      const themeFileTo = resolve(themeDir, themeFile);

      await FsExtra.copy(themeFileFrom, themeFileTo);
      logger.success(`Copied \`${themeFile}\`\n`);
    }
  } catch (err) {
    logger.error(`Could not copy theme files.\n`, err);
    return;
  }
}

init(program);
