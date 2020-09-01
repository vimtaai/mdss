#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";
import Sass from "sass";
import Csso from "csso";

import { resolve } from "path";

import {
  mdssSourceDir,
  localConfigFile,
  defaultConfigDir,
  defaultOutputDir,
} from "./helpers/path.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "s", interactive: true });

program
  .option("-s --screen", "generate print only stylesheet")
  .option("-p --print", "generate print only stylesheet")
  .option("-b --bundle", "generate bundled stylesheet for both media (default)")
  .option("-a --all", "generate separate stylesheets for all media and bundle")
  .option("-d --dev", "genereate uncompressed, development stylesheets")
  .option("-c --config-path [path]", "path to the configuration directory")
  .option("-o --output-path [path]", "path to the output directory")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function build(program) {
  if (program.quiet) {
    logger.disable();
  }

  const isDevBuild = program.dev || false;
  const isOutputSelected = program.screen || program.print || program.bundle;

  const targets = [];
  if (program.all || program.screen) {
    targets.push("screen");
  }
  if (program.all || program.print) {
    targets.push("print");
  }
  if (program.all || program.bundle || !isOutputSelected) {
    targets.push("bundle");
  }

  let localConfigDir = program.configPath || defaultConfigDir;
  let localOutputDir = program.outputPath || defaultOutputDir;

  try {
    const localConfigFileExists = await FsExtra.pathExists(localConfigFile);

    if (localConfigFileExists) {
      logger.await(`Reading config file (mdss.json)...`);

      const configFileContents = await FsExtra.readFile(localConfigFile, "utf-8");
      const { configPath, outputPath } = JSON.parse(configFileContents);

      localConfigDir = configPath;
      localOutputDir = outputPath;
    }
  } catch {
    logger.error(`Could not read config file (mdss.json).`);
    return;
  }

  logger.info(`Config Path:\t ${localConfigDir}\n`);
  logger.info(`Output Path:\t ${localOutputDir}\n`);
  logger.info(`Targets:\t ${targets.join(", ")}\n`);
  logger.info(`Dev Mode:\t ${isDevBuild}\n`);

  try {
    logger.await(`Checking for config dir...`);

    const localConfigDirExists = await FsExtra.pathExists(localConfigDir);

    if (!localConfigDirExists) {
      throw new Error(`Config dir not found`);
    }
  } catch {
    logger.error(`Config dir not found. Did you forget to run "mdss customize"?.`);
    return;
  }

  try {
    logger.await(`Checking for output dir...`);

    await FsExtra.ensureDir(localOutputDir);
  } catch {
    logger.error(`Could not create output dir.`);
    return;
  }

  for (const target of targets) {
    try {
      const isBundleBuild = target === "bundle";
      const outputBasenameSuffix = isBundleBuild ? `` : `-${target}`;
      const outputBasename = `mdss${outputBasenameSuffix}${isDevBuild ? `` : `.min`}.css`;
      const outputFile = resolve(localOutputDir, outputBasename);
      const sassCode = `
        $BUNDLE: ${isBundleBuild};
        $MEDIA: ${isBundleBuild ? "screen print" : target};
        @import "entry/index";
      `;

      const result = Sass.renderSync({
        data: sassCode,
        includePaths: [resolve(localConfigDir), resolve(mdssSourceDir, "src")],
        outputStyle: "expanded",
        outFile: outputFile,
        sourceMap: true,
      });

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
      logger.error(`Could not create output file.`, err);
      return;
    }
  }
}

build(program);
