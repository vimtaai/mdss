#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const fse = require("fs-extra");

const { defaultConfigDir, defaultOutputDir } = require("./utils/constants");
const { mdssConfigDir } = require("./utils/constants");
const { logger } = require("./utils/logger");

program
  .option("-c --config-dir <dir>", "set config directory path")
  .option("-o --output-dir <dir>", "set output directory path")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function init(args) {
  logger.enabled = !args.quiet;

  const options = {
    configDir: args.configDir || defaultConfigDir,
    outputDir: args.outputDir || defaultOutputDir
  };

  logger.info(`config-dir`, options.configDir);
  logger.info(`output-dir`, options.outputDir);

  try {
    await fse.access(path.resolve(options.configDir));
    const message = `Config dir already exsits. Some files may be overwritten.`;
    logger.warning(`config-dir`, message);
  } catch (_) {}

  try {
    await fse.ensureDir(path.resolve(options.configDir));
  } catch (error) {
    const message = `Could not create config dir ${options.configDir}.`;
    logger.error(`config-dir`, message, error);
    return;
  }

  try {
    await fse.ensureDir(path.resolve(options.outputDir));
  } catch (error) {
    const message = `Could not create output dir ${options.outputDir}.`;
    logger.error(`output-dir`, message, error);
    return;
  }

  try {
    await fse.copy(mdssConfigDir, options.configDir);
    logger.success(`copy`, `${mdssConfigDir} -> ${options.configDir}`);
  } catch (error) {
    const message = `Could not copy config files to ${options.configDir}.`;
    logger.error(`copy`, message, error);
  }
}

init(program);
