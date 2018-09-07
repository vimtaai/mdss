#!/usr/bin/env node

const path = require('path')
const program = require('commander')

const { defaultConfigPath, defaultOutputPath } = require('./constants')
const { access, copy, mkdir, readDir, unlink, write } = require('./helpers')

const sourcePath = path.resolve(__dirname, '..')
const configFilePath = path.resolve('mdss.json')

program
  .option('-c --config-path <dir>', 'set configuration directory path', defaultConfigPath)
  .option('-o --output-path <dir>', 'set output directory path', defaultOutputPath)
  .parse(process.argv)

async function customize (program) {
  console.log(`Setting up MDSS for customization...\n`)

  // Command line options
  const options = {
    configPath: program.configPath,
    outputPath: program.outputPath
  }

  // Customizing
  try {
    await access(configFilePath)

    console.log(`[DELETE] mdss.json`)

    await unlink(configFilePath)
  } catch (err) {}

  if (options.configPath !== defaultConfigPath || options.outputPath !== defaultOutputPath) {
    console.log(`[CREATE] mdss.json`)

    const configFileData = {
      configPath: options.configPath,
      outputPath: options.outputPath
    }
    const configFileContents = JSON.stringify(configFileData, null, 2)
    await write(configFilePath, configFileContents)
  }

  mkdir(path.resolve(options.configPath))
  mkdir(path.resolve(options.outputPath))

  const sourceConfigPath = path.join(sourcePath, 'src', 'config')
  const configFiles = await readDir(sourceConfigPath)

  for (const configFile of configFiles) {
    const configFileFrom = path.join(sourceConfigPath, configFile)
    const configFileTo = path.resolve(options.configPath, configFile)

    console.log(`[CREATE] ${configFileTo}`)

    await copy(configFileFrom, configFileTo)
  }
}

customize(program)
