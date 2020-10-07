#!/usr/bin/env node

import Commander from "commander";
import Signale from "signale";
import FsExtra from "fs-extra";
import Sass from "sass";
import Csso from "csso";

import { resolve } from "path";

import { defaultThemeDir, defaultOutputDir, defaultConfigFile } from "./helpers/constants.js";
import { mdssSourceDir, mdssThemeDir } from "./helpers/mdss-paths.js";

const program = new Commander.Command();
const logger = new Signale.Signale({ scope: "mdss", interactive: true });

program
  .option("-c --config-file [path]", "path to the config file")
  .option("-t --theme-dir <path>", "path to the theme directory")
  .option("-o --output-dir <path>", "path to the output directory")
  .option("-d --dev", "genereate uncompressed, development stylesheets")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function build(program) {
  if (program.quiet) {
    logger.disable();
  }

  const isConfigFileSet = program.configFile !== undefined;
  const isThemeDirSet = program.themeDir !== undefined;
  const isOutputDirSet = program.outputDir !== undefined;
  const isConfigFileUsed = isConfigFileSet;

  let configFile = typeof program.configFile === "string" ? program.configFile : defaultConfigFile;
  let themeDir = program.themeDir || defaultThemeDir;
  let outputDir = program.outputDir || defaultOutputDir;
  let isDevBuild = program.dev || false;

  try {
    if (isConfigFileUsed) {
      logger.await(`Reading config file \`${configFile}\`...`);
      const configFileData = await FsExtra.readJson(configFile);

      themeDir = configFileData.themeDir;
      outputDir = configFileData.outputDir;
    }
  } catch (err) {
    logger.error(`Could not read config file \`${configFile}\`.\n`, err);
    return;
  }

  if (isConfigFileUsed) {
    logger.info(`Config file: ${configFile}\n`);
  }
  logger.info(`Theme dir:   ${themeDir}\n`);
  logger.info(`Output dir:  ${outputDir}\n`);
  logger.info(`Dev Mode:    ${isDevBuild}\n`);

  try {
    logger.await(`Checking for theme dir \`${themeDir}\`...`);
    const themeDirExists = await FsExtra.pathExists(themeDir);

    if (!themeDirExists) {
      throw new Error();
    }
  } catch (err) {
    logger.error(`Theme dir \`${themeDir}\` not found. Did you forget to run "mdss init"?\n`, err);
    return;
  }

  try {
    logger.await(`Creating output dir \`${outputDir}\`...`);
    await FsExtra.ensureDir(outputDir);
  } catch {
    logger.error(`Could not create output dir \`${outputDir}\`.\n`, err);
    return;
  }

  try {
    logger.await(`Generating output...`);
    const outputBasename = `mdss${isDevBuild ? `` : `.min`}.css`;
    const outputFile = resolve(outputDir, outputBasename);
    const sassIndexFile = resolve(mdssSourceDir, "index.scss");

    const result = Sass.renderSync({
      file: sassIndexFile,
      includePaths: [resolve(themeDir), resolve(mdssThemeDir)],
      outputStyle: "expanded",
      outFile: outputFile,
      sourceMap: true,
    });

    if (isDevBuild) {
      logger.await(`Writing output file \`${outputBasename}\`...`);
      await FsExtra.writeFile(outputFile, result.css);
      logger.success(`Created \`${outputBasename}\`\n`);

      logger.await(`Writing output file \`${outputBasename}.map\`...`);
      await FsExtra.writeFile(outputFile + ".map", result.map);
      logger.success(`Created \`${outputBasename}.map\`\n`);
    } else {
      const minified = Csso.minify(result.css);
      logger.await(`Writing output file \`${outputBasename}\`...`);
      await FsExtra.writeFile(outputFile, minified.css);
      logger.success(`Created \`${outputBasename}\`\n`);
    }
  } catch (err) {
    logger.error(`Could create output file.\n`, err);
    return;
  }
}

build(program);
