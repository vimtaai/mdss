const { name } = require("../../package.json");
const { blue, bold, green, red, yellow } = require("kleur");

const logger = {
  enabled: true,
  log(color, event, message, alwaysShow = false) {
    if (this.enabled || alwaysShow) {
      // eslint-disable-next-line no-console
      console.log(bold(name), color(event.padEnd(16)), message || "");
    }
  },
  success(event, message) {
    this.log(green, event, message);
  },
  warning(event, message) {
    this.log(yellow, event, message);
  },
  info(event, message) {
    this.log(blue, event, message);
  },
  error(event, message, err) {
    this.log(red, event, message, true);
    this.log(yellow, "error-info", err.message, true);
  }
};

module.exports = {
  logger
};
