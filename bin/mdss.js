#!/usr/bin/env node

const packageInfo = require('../package.json');
const fs = require('fs');
const path = require('path');

const program = require('commander');
const sass = require('node-sass');
const csso = require('csso');
const mkdirp = require('mkdirp');
const copy = require('copy');
const jsonfile = require('jsonfile');

const mdssDir = path.join(__dirname, '..');
const mdssConfigDir = path.join(mdssDir, 'src', 'config');
const localDir = path.resolve();

const defaultConfigDir = 'mdss/config';
const defaultOutputDir = 'mdss/build';

// Script description

program
  .version(packageInfo.version, '-v --version')
  .description('CLI for building and customizing MDSS')
  .usage('<command> [options]')
  .action(helpCommand)
  .on('--help', help);

program
  .command('build')
  .description('Generate custom MDSS stylesheets')
  .option('--screen', 'generate print only stylesheet', false)
  .option('--print', 'generate print only stylesheet', false)
  .option('--slides', 'generate slides only stylesheet', false)
  .option('--bundle', 'generate bundled stylesheet for selected media (default)', false)
  .option('--without-screen', 'exclude screen styles from bundle', false)
  .option('--without-print', 'exclude print styles from bundle', false)
  .option('--without-slides', 'exclude slides styles from bundle', false)
  .option('-a --all', 'generate separate stylesheets for all media and bundle', false)
  .option('-d --dev', 'genereate uncompressed, development stylesheets', false)
  .action(buildCommand);

program
  .command('customize')
  .description('Set up MDSS for customization')
  .option('-c --config-dir <dir>', 'set configuration directory', defaultConfigDir)
  .option('-o --output-dir <dir>', 'set output directory', defaultOutputDir)
  .action(customizeCommand);

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}

// Helper functions

function help () {
  console.log('\n  Command help:\n');
  console.log('    mdss build --help');
  console.log('    mdss customize --help');
}

function toCamelCase (parts) {
  if (parts.length === 0) {
    return '';
  }

  return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

// Command functions

function helpCommand () {
  program.help();
}

function buildCommand (options) {
  console.log('Building MDSS...');

  const dev = options.dev || false;
  const mediaTypes = ['screen', 'print', 'slides'];
  const bundleMedia = mediaTypes.filter(media => !options[toCamelCase(['without', media])]);
  const currentTargets = options.all ? mediaTypes : mediaTypes.filter(type => options[type]);
  if (options.all || options.bundle || currentTargets.length === 0) {
    currentTargets.push('bundle');
  }

  console.log(`Media:\t\t ${currentTargets.join(', ')}`);
  console.log(`Dev Mode:\t ${dev}`);
  if (currentTargets.includes('bundle')) {
    console.log(`Bundled Media:\t ${bundleMedia.join(', ')}`);
  }

  let configDir, outputDir;

  if (!fs.existsSync('mdss.json')) {
    console.log(`No config file found, using default build config.`);
    configDir = defaultConfigDir;
    outputDir = defaultOutputDir;
  } else {
    console.log(`> mdss.json ->`);
    ({configDir, outputDir} = jsonfile.readFileSync('mdss.json'));
  }

  console.log(`Config Dir:\t ${configDir}`);
  console.log(`Output Dir:\t ${outputDir}`);

  mkdirp.sync(configDir);
  mkdirp.sync(outputDir);

  currentTargets.forEach(function (target) {
    const media = (target === 'bundle') ? bundleMedia : target;
    const sassCode = `
      $BUNDLE: ${Array.isArray(media)};
      $MEDIA: ${Array.isArray(media) ? media.join(' ') : media};
      @import "entry/index";
    `;
    const entryFile = path.join(mdssDir, 'src', 'entry', 'index.scss');
    const outputFileName = `mdss${Array.isArray(media) ? `` : `-${media}`}${dev ? `` : `.min`}.css`;
    const outputFile = path.join(localDir, outputDir, outputFileName);

    console.log(`> ${entryFile} -> ${outputFile}`);
    const result = sass.renderSync({
      data: sassCode,
      includePaths: [
        path.join(localDir, configDir),
        path.join(mdssDir, 'src', 'config'),
        path.join(mdssDir, 'src')
      ],
      outputStyle: 'expanded',
      outFile: outputFile
    });

    const css = (dev ? result.css : csso.minify(result.css).css);
    fs.writeFile(outputFile, css, function (error) {
      if (error) {
        console.error(`Unable to create file ${outputFile}!`, error);
      }
    });
  });
}

function customizeCommand (options) {
  console.log(`Setting up MDSS for customization...`);

  const configDir = path.join(localDir, options.configDir);
  const outputDir = path.join(localDir, options.outputDir);

  console.log(`Config Dir:\t ${options.configDir}`);
  console.log(`Output Dir:\t ${options.outputDir}`);

  mkdirp.sync(configDir);
  mkdirp.sync(outputDir);

  console.log(`> unlink mdss.json`);
  if (fs.existsSync('mdss.json')) {
    fs.unlinkSync('mdss.json');
  }

  if (options.configDir !== defaultConfigDir || options.outputDir !== defaultOutputDir) {
    console.log(`> config -> mdss.json`);
    const config = {
      configDir: options.configDir,
      outputDir: options.outputDir
    };
    jsonfile.writeFileSync('mdss.json', config, { spaces: 2 });
  }

  console.log(`> ${path.join(mdssConfigDir, '*.scss')} -> ${configDir}`);
  copy(path.join(mdssConfigDir, '*.config.scss'), configDir, function () {
  });
}
