#!/usr/bin/env node

const package = require('../package.json');
const fs = require('fs');
const path = require('path');

const program = require('commander');
const sass = require('node-sass')
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
  .version(package.version, '-v --version')
  .description('CLI for building and customizing MDSS')
  .usage('<command> [options]')
  .action(helpCommand)
  .on('--help', help);

program
  .command('build')
  .description('Generate custom MDSS stylesheets')
  .option('--bundle', 'generate bundled stylesheet for all media (default)', false)
  .option('--screen', 'generate only print stylesheet', false)
  .option('--print', 'generate only print stylesheet', false)
  .option('--slides', 'generate only slides stylesheet', false)
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

// Script functions

function helpCommand() {
  program.help();
}

function help() {
  console.log('\n  Command help:\n');
  console.log('    mdss build --help');
  console.log('    mdss customize --help')
}

function buildCommand(options) {
  console.log('Building MDSS...');

  const mediaTypes = ['bundle', 'screen', 'print', 'slides'];
  const media = options.all ? mediaTypes : mediaTypes.filter(type => options[type]);
  if (media.length === 0) {
    media.push('bundle');
  }
  const dev = options.dev || false;

  console.log(`Media:\t\t ${media.join()}`);
  console.log(`Dev Mode:\t ${dev}`);

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

  //console.log(`Input File:\t ${inputFile}`);
  //console.log(`Output File:\t ${outputFile}`);

  mkdirp.sync(configDir);
  mkdirp.sync(outputDir);

  media.forEach(function (type) {
    const inputFileName = `${type == `bundle` ? `index` : type}.scss`;
    const inputFile = path.join(mdssDir, 'src', 'entry', inputFileName);
    const outputFileName = `mdss${type == `bundle` ? `` : `-${type}`}${dev ? `` : `.min`}.css`;
    const outputFile = path.join(localDir, outputDir, outputFileName);

    console.log(`> ${inputFile} -> ${outputFile}`);
    const result = sass.renderSync({
      file: inputFile,
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

function customizeCommand(options) {
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
    console.log(`> config -> mdss.json`)
    const config = {
      configDir: options.configDir,
      outputDir: options.outputDir
    };
    jsonfile.writeFileSync('mdss.json', config, { spaces: 2 });
  }

  console.log(`> ${path.join(mdssConfigDir, '*.scss')} -> ${configDir}`);
  copy(path.join(mdssConfigDir, '*.scss'), configDir, function () {
  });
}
