const fs = require('fs')
const path = require('path')

const defaultConfigPath = 'mdss/config'
const defaultOutputPath = 'mdss/build'

function readConfigFile (configFile) {
  const config = {}

  if (!fs.existsSync(configFile)) {
    console.log(`[INFO] No config file available, using default build config.\n`)
    config.configPath = defaultConfigPath
    config.outputPath = defaultOutputPath
  } else {
    console.log(`[READ] mdss.json\n`)
    const configFileContents = fs.readFileSync(configFile, 'utf-8')
    const configFileData = JSON.parse(configFileContents)
    config.configPath = configFileData.configPath
    config.outputPath = configFileData.outputPath
  }

  config.configAbsolutePath = path.resolve(config.configPath)
  config.outputAbsolutePath = path.resolve(config.outputPath)

  console.log(`Config Path:\t ${config.configPath}`)
  console.log(`Output Path:\t ${config.outputPath}\n`)

  return config
}

module.exports = {
  defaultConfigPath,
  defaultOutputPath,
  readConfigFile
}
