#!/usr/bin/env node

const program = require("commander");
const sass = require("sass");
const csso = require("csso");

const { resolve, posix } = require("path");
const { access, ensureDir, readFile, writeFile } = require("fs-extra");

const { logger } = require("./utils/logger");
const { defaults, mdss } = require("./utils/constants");

program
  .option("-s --screen", "generate print only stylesheet")
  .option("-p --print", "generate print only stylesheet")
  .option("-b --bundle", "generate bundled stylesheet for selected media (default)")
  .option("-a --all", "generate separate stylesheets for all media and bundle")
  .option("-d --dev", "genereate uncompressed, development stylesheets")
  .option("-c --config-path [path]", "path to the configuration directory", defaults.configPath)
  .option("-o --output-path [path]", "path to the output directory", defaults.outputPath)
  .option("-q --quiet", "omit console output")
  .parse(process.argv);

async function build(program) {
  // Command line options
  const options = {
    dev: program.dev || false,
    target: {
      bundle: program.all || program.bundle || (!program.screen && !program.print),
      screen: program.all || program.screen,
      print: program.all || program.print
    }
  };

  const bundle = ["print", "screen"];
  const targets = Object.keys(options.target).filter(target => options.target[target]);

  // Configuration
  const config = {
    configPath: program.configPath,
    outputPath: program.outputPath
  };

  if (program.quiet) {
    logger.disable();
  }

  try {
    await access(mdss.configFile);

    logger.info(`Using config in mdss.json\n`);

    const configFileContents = await readFile(mdss.configFile, "utf-8");
    const configFileData = JSON.parse(configFileContents);

    config.configPath = configFileData.configPath;
    config.outputPath = configFileData.outputPath;
  } catch {}

  // Info output
  logger.info(`Config Path:\t ${config.configPath}\n`);
  logger.info(`Output Path:\t ${config.outputPath}\n`);
  logger.info(`Target:\t\t ${targets.join(", ")}\n`);
  if (options.target.bundle) {
    logger.info(`Bundled Media:\t ${bundle.join(", ")}`);
  }
  logger.info(`Dev Mode:\t\t ${options.dev}\n`);

  // Checking if config exists
  try {
    await access(config.configPath);
  } catch (err) {
    logger.error(`Config dir not found. Did you forget to run "mdss init"? Exiting.`);
    return;
  }

  // Building
  try {
    ensureDir(config.outputPath);
  } catch (err) {
    logger.error(`Could not create output folder. Exiting.`, err);
    return;
  }

  for (const target of targets) {
    try {
      const media = target === "bundle" ? bundle : target;
      const sassCode = `
      $BUNDLE: ${Array.isArray(media)};
      $MEDIA: ${Array.isArray(media) ? media.join(" ") : media};
      @import "entry/index";
    `;
      const suffix = Array.isArray(media) ? `` : `-${media}`;
      const outputFileName = `mdss${suffix}${options.dev ? `` : `.min`}.css`;
      const outputFilePath = posix.join(config.outputPath, outputFileName);

      logger.await(`Creating ${outputFilePath}...`);
      const result = sass.renderSync({
        data: sassCode,
        includePaths: [resolve(config.configPath), resolve(mdss.sourcePath)],
        outputStyle: "expanded",
        outFile: outputFilePath,
        sourceMap: true
      });

      if (options.dev) {
        await writeFile(outputFilePath, result.css);
        logger.created(`${outputFilePath}\n`);
        await writeFile(outputFilePath + ".map", result.map);
        logger.created(`${outputFilePath}.map\n`);
      } else {
        const minified = csso.minify(result.css);
        await writeFile(outputFilePath, minified.css);
        logger.created(`${outputFilePath}\n`);
      }
    } catch (err) {
      logger.error(`Could not create output for \`${target}\`. Exiting`, err);
      return;
    }
  }
}

build(program);
