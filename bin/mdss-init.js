#!/usr/bin/env node

const program = require("commander");

const { resolve, posix } = require("path");
const { access, copy, ensureDir, readdir, unlink, writeFile } = require("fs-extra");

const { logger } = require("./utils/logger");
const { defaults, mdss } = require("./utils/constants");

program
  .option("-c --config-path <dir>", "set configuration directory path", defaults.configPath)
  .option("-o --output-path <dir>", "set output directory path", defaults.outputPath)
  .parse(process.argv);

async function customize(program) {
  // Command line options
  const config = {
    configPath: program.configPath,
    outputPath: program.outputPath
  };

  console.log(JSON.stringify(config));

  // Customizing
  try {
    await access(mdss.configFile);
    await unlink(mdss.configFile);
  } catch {}

  try {
    if (config.configPath !== defaults.configPath || config.outputPath !== defaults.outputPath) {
      logger.await(`mdss.json`);

      const configFileData = {
        configPath: posix.normalize(config.configPath),
        outputPath: posix.normalize(config.outputPath)
      };
      const configFileContents = JSON.stringify(configFileData, null, 2);

      await writeFile(mdss.configFile, configFileContents);
      logger.created("mdss.json\n");
    }
  } catch {
    logger.error(`Could not create MDSS config file. Exiting.`);
    return;
  }

  try {
    logger.await(`${config.configPath}`);
    ensureDir(resolve(config.configPath));
    logger.created(`${config.configPath}\n`);
  } catch {
    logger.error(`Could not create config folder. Exiting.`);
    return;
  }

  try {
    logger.await(`${config.outputPath}`);
    ensureDir(resolve(config.outputPath));
    logger.created(`${config.outputPath}\n`);
  } catch (err) {
    logger.error(`Could not create output folder. Exiting.`);
    return;
  }

  try {
    mdss.configFiles = await readdir(mdss.configPath);
  } catch {
    logger.error(`Could access MDSS config files. Exiting.`);
    return;
  }

  for (const configFile of mdss.configFiles) {
    const configFileFrom = posix.join(mdss.configPath, configFile);
    const configFileTo = posix.join(config.configPath, configFile);

    logger.await(`${posix.join(configFileTo)}`);
    await copy(resolve(configFileFrom), resolve(configFileTo));
    logger.created(`${configFileTo}\n`);
  }
}

customize(program);
