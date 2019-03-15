const chalk = require("chalk");

const { name } = require("../package.json");

const logger = {
  enabled: true,
  write(...messages) {
    if (this.enabled) {
      console.log(chalk.bold(name), ...messages);
    }
  },
  info(event, message = "") {
    this.write(chalk.blue(event), message);
  },
  error(event, message = "") {
    this.write(chalk.red(event), message);
  },
  warning(event, message = "") {
    this.write(chalk.yellow(event), message);
  },
  success(event, message = "") {
    this.write(chalk.green(event), message);
  }
};

module.exports = {
  logger
};
