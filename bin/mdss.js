#!/usr/bin/env node

const package = require('../package.json');
const program = require('commander');

const path = require('path');
const mkdirp = require('mkdirp');
const copy = require('copy');

const mdssFolder = path.join(__dirname, '..');
const mdssConfigFolder = path.join(mdssFolder, 'src', 'config');
const localFolder = path.resolve();

// Script description
program
  .version(package.version, '-v --version')
  .usage('<command> [options]');

program
  .command('build')
  .description('generate custom MDSS stylesheets')
  .option('-d --dev', 'genereate uncompressed, development stylesheets', false)
  .option('--screen-only', 'generate only print stylesheet', false)
  .option('--print-only', 'generate only print stylesheet', false)
  .option('--slides-only', 'generate only slides stylesheet', false)
  .action(build);

program
  .command('customize')
  .description('set up MDSS for customization')
  .option('-c --config-dir <dir>', 'set configuration directory', 'mdss/config')
  .option('-o --output-dir <dir>', 'set output directory', 'mdss/build')
  .action(customize);

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}

// Script functions

function build(options) {
  console.log('Building MDSS...');

  const media = options.screenOnly ? 'screen' :
                options.printOnly ? 'print' : 
                options.slidesOnly ? 'slides' : 
                'all';

  console.log('Media:\t\t', media);
  console.log('Dev Mode:\t', options.dev);
}

function customize(options) {
  console.log('Setting up MDSS for customization...');

  const configDir = path.join(localFolder, options.configDir);
  const outputDir = path.join(localFolder, options.outputDir);

  console.log('Config Dir:\t', configDir);
  console.log('Output Dir:\t', outputDir);

  mkdirp(configDir);
  mkdirp(outputDir);

  console.log('Copying config files... ');
  console.log(path.join(mdssConfigFolder, '*.scss'), '->', configDir);

  copy(path.join(mdssConfigFolder, '*.scss'), configDir, () => {
    console.log('Copy successful!');
  });
}
