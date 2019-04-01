const chalk = require("chalk");

const { name } = require("../../package.json");

function createLogger(levelTypes) {
  const logger = { enabled: true };
  for (const { level, color, alwaysShow = false } of levelTypes) {
    logger[level] = function(event, message = "") {
      if (alwaysShow || this.enabled) {
        const eventString = chalk[color](event.padEnd(16));
        // eslint-disable-next-line no-console
        console.log(chalk.bold(name), eventString, message);
      }
    };
  }
  return logger;
}

const logger = createLogger([
  { level: "info", color: "blue" },
  { level: "error", color: "red", alwaysShow: true },
  { level: "warning", color: "yellow" },
  { level: "success", color: "green" }
]);

module.exports = {
  logger
};
