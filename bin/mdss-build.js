#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";
import Sass from "sass";
import Csso from "csso";

import { resolve } from "path";

import { defaultConfigDir, defaultOutputDir, defaultConfigFile } from "./helpers/constants.js";
import { mdssConfigDir } from "./helpers/mdss-paths.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "mdss", interactive: true });

program
  .option("-f --config-file <path>", "path to the configuration file")
  .option("-c --config-path <path>", "path to the configuration directory")
  .option("-o --output-path <path>", "path to the output directory")
  .option("-s --screen", "generate print only stylesheet")
  .option("-p --print", "generate print only stylesheet")
  .option("-b --bundle", "generate bundled stylesheet for both media (default)")
  .option("-a --all", "generate separate stylesheets for all media and bundle")
  .option("-d --dev", "genereate uncompressed, development stylesheets")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function build(program) {
  if (program.quiet) {
    logger.disable();
  }

  const configFile = program.configFile || defaultConfigFile;
  const isDevBuild = program.dev || false;
  const isOutputSelected = program.screen || program.print || program.bundle;

  const targets = {
    screen: program.all || program.screen,
    print: program.all || program.print,
    bundle: program.all || program.bundle || !isOutputSelected,
  };

  let configDir = program.configPath || defaultConfigDir;
  let outputDir = program.outputPath || defaultOutputDir;

  try {
    logger.await(`Checking for config file \`${configFile}\`...`);
    const configFileExists = await FsExtra.pathExists(configFile);

    if (configFileExists) {
      logger.await(`Reading config file \`${configFile}\`...`);

      const configFileContents = await FsExtra.readFile(configFile, "utf-8");
      const { configPath, outputPath } = JSON.parse(configFileContents);

      configDir = configPath;
      outputDir = outputPath;
    }
  } catch (err) {
    logger.error(`Could not read config file \`${configDir}\`.`, err);
    return;
  }

  logger.info(`Config Path:\t ${configDir}\n`);
  logger.info(`Output Path:\t ${outputDir}\n`);
  logger.info(`Targets:\t ${targets.join(", ")}\n`);
  logger.info(`Dev Mode:\t ${isDevBuild}\n`);

  try {
    logger.await(`Checking for config dir...`);
    const configDirExists = await FsExtra.pathExists(configDir);

    if (!configDirExists) {
      throw new Error(`Config dir not found`);
    }
  } catch (err) {
    logger.error(`Config dir not found. Did you forget to run "mdss customize"?.\n`, err);
    return;
  }

  try {
    logger.await(`Checking for output dir...`);
    await FsExtra.ensureDir(outputDir);
  } catch {
    logger.error(`Could not create output dir \`${outputFile.dir}\`.\n`, err);
    return;
  }

  for (const target of targets) {
    try {
      logger.await(`Generating output...`);
      const isBundleBuild = target === "bundle";
      const outputBasenameSuffix = isBundleBuild ? `` : `-${target}`;
      const outputBasename = `mdss${outputBasenameSuffix}${isDevBuild ? `` : `.min`}.css`;
      const outputFile = resolve(outputDir, outputBasename);

      const sassCode = `
        $BUNDLE: ${isBundleBuild};
        $MEDIA: ${isBundleBuild ? "screen print" : target};
        @import "entry/index";
      `;

      const result = Sass.renderSync({
        data: sassCode,
        includePaths: [resolve(configDir), resolve(mdssConfigDir)],
        outputStyle: "expanded",
        outFile: outputFile,
        sourceMap: true,
      });

      logger.await(`Writing output...`);

      if (isDevBuild) {
        await FsExtra.writeFile(outputFile, result.css);
        logger.success(`Created ${outputBasename}.map\n`);
        await FsExtra.writeFile(outputFile + ".map", result.map);
      } else {
        const minified = Csso.minify(result.css);
        await FsExtra.writeFile(outputFile, minified.css);
      }

      logger.success(`Created ${outputBasename}\n`);
    } catch (err) {
      logger.error(`Could create output file \`${outputBasename}\`.\n`, err);
      return;
    }
  }
}

build(program);
