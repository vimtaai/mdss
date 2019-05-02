#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const fse = require("fs-extra");
const sass = require("node-sass");
const csso = require("csso");

const { defaultConfigDir, defaultOutputDir } = require("./utils/constants");
const { mdssSrcDir } = require("./utils/constants");
const { logger } = require("./utils/logger");

program
  .option("-s --screen", "generate screen only stylesheet")
  .option("-p --print", "generate print only stylesheet")
  .option("-b --bundle", "generate bundled stylesheet (default)")
  .option("-a --all", "generate screen, print and bundle stylesheets")
  .option("-d --dev", "genereate uncompressed, development stylesheets")
  .option("-c --config-dir [dir]", "path to the configuration directory")
  .option("-o --output-dir [dir]", "path to the output directory")
  .option("-n --node-modules", "allow SCSS import from `node_modules`")
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function build(args) {
  logger.enabled = !args.quiet;

  const options = {
    configDir: args.configDir || defaultConfigDir,
    outputDir: args.outputDir || defaultOutputDir,
    devMode: args.dev || false,
    nodeModules: args.nodeModules || false,
    media: {
      bundle: args.all || args.bundle || (!args.screen && !args.print),
      screen: args.all || args.screen,
      print: args.all || args.print
    }
  };

  options.mediaList = Object.keys(options.media).filter(
    target => options.media[target]
  );

  logger.info(`config-dir`, options.configDir);
  logger.info(`output-dir`, options.outputDir);
  logger.info(`target-media`, options.mediaList.join(", "));
  logger.info(`dev-mode`, options.devMode);

  try {
    await fse.access(options.configDir);
  } catch (error) {
    const message = `Config dir not found. Did you forget to run \`npx mdss init\`?`;
    logger.error(`config-dir`, message);
    logger.warning(`error-info`, error.message);
    return;
  }

  try {
    await fse.ensureDir(options.outputDir);
  } catch (error) {
    const message = `Could not create output dir \`${options.outputDir}\`.`;
    logger.error(`output-dir`, message);
    logger.warning(`error-info`, error);
    return;
  }

  for (const media of options.mediaList) {
    const isBundle = media === "bundle";
    const sassCode = `
      $BUNDLE: ${isBundle};
      $MEDIA: ${isBundle ? "screen print" : media};
      @import "entry/index";
    `;

    const mediaSuffix = isBundle ? `` : `-${media}`;
    const devSuffix = options.devMode ? `` : `.min`;
    const outputFileName = `mdss${mediaSuffix}${devSuffix}.css`;
    const outputFilePath = path.join(options.outputDir, outputFileName);
    const result = {};

    try {
      const includePaths = [options.configDir, mdssSrcDir];

      if (options.nodeModules) {
        includePaths.push("node_modules");
      }

      result.build = sass.renderSync({
        data: sassCode,
        includePaths,
        outputStyle: "expanded",
        outFile: outputFilePath,
        sourceMap: true
      });
    } catch (error) {
      const message = `Could not compile stylesheet for media \`${media}\`.`;
      logger.error(`compile`, message);
      logger.warning(`error-info`, error.message);
      return;
    }

    try {
      if (options.devMode) {
        await fse.outputFile(outputFilePath, result.build.css);
        logger.success(`create`, `${outputFilePath}`);
        await fse.outputFile(`${outputFilePath}.map`, result.build.map);
        logger.success(`create`, `${outputFilePath}.map`);
      } else {
        const minified = csso.minify(result.build.css);
        await fse.outputFile(outputFilePath, minified.css);
        logger.success(`create`, `${outputFilePath}`);
      }
    } catch (error) {
      const message = `Could not write output file \`${outputFilePath}\`.`;
      logger.error(`write`, message);
      logger.warning(`error-info`, error.message);
      return;
    }
  }
}

build(program);
