#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const program = require('commander')

const { defaultConfigPath, defaultOutputPath } = require('./helpers')

const sourcePath = path.resolve(__dirname, '..')
const configFilePath = path.resolve('mdss.json')

program
  .option('-c --config-path <dir>', 'set configuration directory', defaultConfigPath)
  .option('-o --output-path <dir>', 'set output directory', defaultOutputPath)
  .parse(process.argv)

console.log(`Setting up MDSS for customization...\n`)

const options = {
  configPath: program.configPath,
  outputPath: program.outputPath
}

if (fs.existsSync(configFilePath)) {
  console.log(`[DELETE] mdss.json`)

  fs.unlinkSync(configFilePath)
}

if (options.configPath !== defaultConfigPath || options.outputPath !== defaultOutputPath) {
  console.log(`[CREATE] mdss.json`)

  const configFileData = {
    configPath: options.configPath,
    outputPath: options.outputPath
  }
  const configFileContents = JSON.stringify(configFileData, null, 2)
  fs.writeFileSync(configFilePath, configFileContents)
}

mkdirp.sync(path.resolve(options.configPath))
mkdirp.sync(path.resolve(options.outputPath))

const sourceConfigPath = path.join(sourcePath, 'src', 'config')
const configFiles = fs.readdirSync(sourceConfigPath)

for (const configFile of configFiles) {
  const configFileFrom = path.join(sourceConfigPath, configFile)
  const configFileTo = path.resolve(options.configPath, configFile)

  console.log(`[CREATE] ${configFileTo}`)

  fs.copyFileSync(configFileFrom, configFileTo)
}
