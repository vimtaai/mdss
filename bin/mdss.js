#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander');
const mkdirp = require('mkdirp');
const sass = require('node-sass'); // Build tool
const csso = require('csso'); // Minifying tool

const mdssDir = path.resolve(__dirname, '..');
const mdssConfigDir = path.join(mdssDir, 'src', 'config');
const localDir = path.resolve();
const localConfigFile = path.join(localDir, 'mdss.json');

const defaultConfigDir = 'mdss/config';
const defaultOutputDir = 'mdss/build';

// Script description

program
  .description('CLI for building and customizing MDSS')
  .usage('<command> [options]')
  .action(commandHelp);

program
  .command('build')
  .description('Generate custom MDSS stylesheets')
  .option('-s --screen', 'generate print only stylesheet')
  .option('-p --print', 'generate print only stylesheet')
  .option('-b --bundle', 'generate bundled stylesheet for selected media (default)')
  .option('--without-screen', 'exclude screen styles from bundle')
  .option('--without-print', 'exclude print styles from bundle')
  .option('-a --all', 'generate separate stylesheets for all media and bundle')
  .option('-d --dev', 'genereate uncompressed, development stylesheets')
  .action(commandBuild);

program
  .command('customize')
  .alias('configure')
  .description('Set up MDSS for customization')
  .option('-c --config-dir <dir>', 'set configuration directory', defaultConfigDir)
  .option('-o --output-dir <dir>', 'set output directory', defaultOutputDir)
  .action(commandCustomize);

program.parse(process.argv);

// Command functions

function commandHelp () {
  program.help();
}

function commandBuild (options) {
  console.log('Building MDSS...');

  const config = {
    dev: options.dev || false,
    target: {
      bundle: options.all || options.bundle,
      screen: options.all || options.screen,
      print: options.all || options.print
    },
    bundle: {
      screen: !options.withoutScreen,
      print: !options.withoutPrint
    }
  };

  if (!config.target.bundle && !config.target.screen && !config.target.print) {
    config.target.bundle = true;
  }

  const targets = Object.keys(config.target).filter(target => config.target[target]);
  const bundle = Object.keys(config.bundle).filter(media => config.bundle[media]);

  console.log();
  console.log(`Target:\t\t ${targets.join(', ')}`);
  console.log(`Dev Mode:\t ${config.dev}`);
  if (config.target.bundle) {
    console.log(`Bundled Media:\t ${bundle.join(', ')}`);
  }
  console.log();

  let configDir, outputDir;

  if (!fs.existsSync(localConfigFile)) {
    console.log(`[INFO] No config file available, using default build config.`);
    configDir = defaultConfigDir;
    outputDir = defaultOutputDir;
  } else {
    console.log(`[READ] mdss.json`);
    const configFileContent = fs.readFileSync(localConfigFile, 'utf-8');
    ({configDir, outputDir} = JSON.parse(configFileContent));
  }

  if (!fs.existsSync(configDir)) {
    console.error(`[ERROR] Config dir not found. Did you forget to run "mdss customize"? Exiting.`);
    return;
  }

  console.log();
  console.log(`Config Dir:\t ${configDir}`);
  console.log(`Output Dir:\t ${outputDir}`);
  console.log();

  mkdirp.sync(outputDir);

  for (const target of targets) {
    const media = (target === 'bundle') ? bundle : target;
    const sassCode = `
      $BUNDLE: ${Array.isArray(media)};
      $MEDIA: ${Array.isArray(media) ? media.join(' ') : media};
      @import "entry/index";
    `;
    const suffix = Array.isArray(media) ? `` : `-${media}`;
    const outputFileName = `mdss${suffix}${config.dev ? `` : `.min`}.css`;
    const outputFile = path.join(localDir, outputDir, outputFileName);

    console.log(`[CREATE] ${outputFile}`);
    const result = sass.renderSync({
      data: sassCode,
      includePaths: [
        configDir,
        path.join(mdssDir, 'src')
      ],
      outputStyle: 'expanded',
      outFile: outputFile,
      sourceMap: true
    });

    let css;

    if (config.dev) {
      css = result.css;
      console.log(`[CREATE] ${outputFile}.map`);
      fs.writeFileSync(outputFile + '.map', result.map);
    } else {
      const minified = csso.minify(result.css);
      css = minified.css;
    }
    fs.writeFileSync(outputFile, css);
  }
}

function commandCustomize (options) {
  console.log(`Setting up MDSS for customization...`);

  const configDir = path.resolve(options.configDir);
  const outputDir = path.resolve(options.outputDir);

  console.log();
  console.log(`Config Dir:\t ${options.configDir}`);
  console.log(`Output Dir:\t ${options.outputDir}`);
  console.log();

  if (fs.existsSync(localConfigFile)) {
    console.log(`[DELETE] mdss.json`);

    fs.unlinkSync(localConfigFile);
  }

  if (options.configDir !== defaultConfigDir || options.outputDir !== defaultOutputDir) {
    console.log(`[CREATE] mdss.json`);

    const config = {
      configDir: options.configDir,
      outputDir: options.outputDir
    };
    const configFileContent = JSON.stringify(config, null, 2);
    fs.writeFileSync(localConfigFile, configFileContent);
  }

  mkdirp.sync(configDir);
  mkdirp.sync(outputDir);

  const configFiles = fs.readdirSync(mdssConfigDir);

  for (const configFile of configFiles) {
    const configFileFrom = path.join(mdssConfigDir, configFile);
    const configFileTo = path.join(configDir, configFile);

    console.log(`[CREATE] ${configFileTo}`);

    fs.copyFileSync(configFileFrom, configFileTo);
  }
}
