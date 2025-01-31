#!/usr/bin/env node

const path = require('path')
const program = require('commander')

const { defaultConfigPath, defaultOutputPath } = require('./constants')
const { access, mkdir, read, write } = require('./helpers')

const sourcePath = path.resolve(__dirname, '..')
const configFilePath = path.resolve('mdss.json')

program
  .option('-s --screen', 'generate print only stylesheet')
  .option('-p --print', 'generate print only stylesheet')
  .option('-b --bundle', 'generate bundled stylesheet for selected media (default)')
  .option('--without-screen', 'exclude screen styles from bundle')
  .option('--without-print', 'exclude print styles from bundle')
  .option('-a --all', 'generate separate stylesheets for all media and bundle')
  .option('-d --dev', 'genereate uncompressed, development stylesheets')
  .option('-c --config-path [path]', 'path to the configuration directory')
  .option('-o --output-path [path]', 'path to the output directory')
  .parse(process.argv)

const sass = require('sass') // Build tool
const csso = require('csso') // Minifying tool

async function build (program) {
  console.log(`Building MDSS...\n`)

  // Command line options
  const options = {
    dev: program.dev || false,
    target: {
      bundle: program.all || program.bundle,
      screen: program.all || program.screen,
      print: program.all || program.print
    },
    bundle: {
      screen: !program.withoutScreen,
      print: !program.withoutPrint
    }
  }

  if (!options.target.bundle && !options.target.screen && !options.target.print) {
    options.target.bundle = true
  }

  const targets = Object.keys(options.target).filter(target => options.target[target])
  const bundle = Object.keys(options.bundle).filter(media => options.bundle[media])

  // Configuration
  const config = {
    configPath: program.configPath || defaultConfigPath,
    outputPath: program.outputPath || defaultOutputPath
  }

  try {
    await access(configFilePath)
    console.log(`[READ] mdss.json\n`)
    const configFileContents = await read(configFilePath, 'utf-8')
    const configFileData = JSON.parse(configFileContents)
    config.configPath = configFileData.configPath
    config.outputPath = configFileData.outputPath
  } catch (_) {}

  config.configAbsolutePath = path.resolve(config.configPath)
  config.outputAbsolutePath = path.resolve(config.outputPath)

  // Info output
  console.log(`Config Path:\t ${config.configPath}`)
  console.log(`Output Path:\t ${config.outputPath}\n`)
  console.log(`Target:\t\t ${targets.join(', ')}`)
  if (options.target.bundle) {
    console.log(`Bundled Media:\t ${bundle.join(', ')}`)
  }
  console.log(`Dev Mode:\t ${options.dev}\n`)

  try {
    await access(config.configAbsolutePath)
  } catch (err) {
    console.error(`[ERROR] Config dir not found. Did you forget to run "mdss customize"? Exiting.`)
    return
  }

  console.log(`Config Dir:\t ${config.configPath}`)
  console.log(`Output Dir:\t ${config.outputPath}\n`)

  // Building
  mkdir(config.outputAbsolutePath)

  for (const target of targets) {
    const media = (target === 'bundle') ? bundle : target
    const sassCode = `
      $BUNDLE: ${Array.isArray(media)};
      $MEDIA: ${Array.isArray(media) ? media.join(' ') : media};
      @import "entry/index";
    `
    const suffix = Array.isArray(media) ? `` : `-${media}`
    const outputFileName = `mdss${suffix}${options.dev ? `` : `.min`}.css`
    const outputFilePath = path.join(config.outputAbsolutePath, outputFileName)

    console.log(`[CREATE] ${outputFilePath}`)

    const result = sass.renderSync({
      data: sassCode,
      includePaths: [
        config.configAbsolutePath,
        path.join(sourcePath, 'src')
      ],
      outputStyle: 'expanded',
      outFile: outputFilePath,
      sourceMap: true
    })

    if (options.dev) {
      await write(outputFilePath, result.css)
      console.log(`[CREATE] ${outputFilePath}.map`)
      await write(outputFilePath + '.map', result.map)
    } else {
      const minified = csso.minify(result.css)
      await write(outputFilePath, minified.css)
    }
  }
}

build(program)
