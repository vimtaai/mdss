#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";
import Sass from "sass";
import Csso from "csso";

import { resolve } from "path";

import { defaultThemeDir, defaultOutputDir, defaultConfigFile } from "./helpers/constants.js";
import { mdssThemeDir } from "./helpers/mdss-paths.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "mdss", interactive: true });

program
  .option("-c --config-file <path>", "path to the configuration file")
  .option("-t --theme-dir <path>", "path to the theme directory")
  .option("-o --output-dir <path>", "path to the output directory")
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

  let themeDir = program.themeDir || defaultThemeDir;
  let outputDir = program.outputDir || defaultOutputDir;

  try {
    logger.await(`Checking for config file \`${configFile}\`...`);
    const configFileExists = await FsExtra.pathExists(configFile);

    if (configFileExists) {
      logger.await(`Reading config file \`${configFile}\`...`);

      const configFileContents = await FsExtra.readFile(configFile, "utf-8");
      const { themeDir, outputDir } = JSON.parse(configFileContents);

      themeDir = themeDir; // ! TODO
      outputDir = outputDir; // ! TODO
    }
  } catch (err) {
    logger.error(`Could not read config file \`${configFile}\`.`, err);
    return;
  }

  logger.info(`Theme dir:\t ${themeDir}\n`);
  logger.info(`Output dir:\t ${outputDir}\n`);
  logger.info(
    `Targets:\t ${Object.keys(targets)
      .filter((target) => targets[target])
      .join(", ")}\n`
  ); // ! TODO
  logger.info(`Dev Mode:\t ${isDevBuild}\n`);

  try {
    logger.await(`Checking for theme dir...`);
    const themeDirExists = await FsExtra.pathExists(themeDir);

    if (!themeDirExists) {
      throw new Error(`Theme dir not found`);
    }
  } catch (err) {
    logger.error(`Theme dir not found. Did you forget to run "mdss init"?.\n`, err);
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
        includePaths: [resolve(themeDir), resolve(mdssThemeDir)],
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
