#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const program = require('commander')

const sass = require('node-sass') // Build tool
const csso = require('csso') // Minifying tool

const { readConfigFile } = require('./helpers')

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
  .parse(process.argv)

console.log(`Building MDSS...\n`)

const config = readConfigFile(configFilePath)
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

console.log(`Target:\t\t ${targets.join(', ')}`)
if (options.target.bundle) {
  console.log(`Bundled Media:\t ${bundle.join(', ')}`)
}
console.log(`Dev Mode:\t ${options.dev}\n`)

if (!fs.existsSync(config.configAbsolutePath)) {
  console.error(`[ERROR] Config dir not found. Did you forget to run "mdss customize"? Exiting.`)
  process.exit()
}

console.log(`Config Dir:\t ${config.configPath}`)
console.log(`Output Dir:\t ${config.outputPath}\n`)

mkdirp.sync(config.outputAbsolutePath)

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

  let css

  if (options.dev) {
    css = result.css
    console.log(`[CREATE] ${outputFilePath}.map`)
    fs.writeFileSync(outputFilePath + '.map', result.map)
  } else {
    const minified = csso.minify(result.css)
    css = minified.css
  }

  fs.writeFileSync(outputFilePath, css)
}
