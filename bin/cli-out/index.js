const fs = require("fs");
const path = require("path");

function readPackageJson() {
  let packageJsonDir = path.resolve(__dirname, "..");
  let packageJsonPath = path.join(packageJsonDir, "package.json");

  while (!fs.existsSync(packageJsonPath)) {
    const parentDir = path.resolve(packageJsonDir, "..");

    if (parentDir === packageJsonDir) {
      return undefined;
    }

    packageJsonDir = parentDir;
    packageJsonPath = path.join(packageJsonDir, "package.json");
  }

  return require(packageJsonPath);
}

const colors = {
  red: "31",
  green: "32",
  blue: "34",
  yellow: "33",
  magenta: "35",
  bold: "1"
};

const cli = {
  prefix: readPackageJson().name,
  enabled: true,
  colorEnabled: !process.env.NODE_DISABLE_COLORS && process.env.TERM !== "dumb",
  log(color, event, data, alwaysShow = false) {
    if (this.enabled || alwaysShow) {
      const isJson = typeof data === "object";
      const outName = `\x1b[${colors.bold}m${this.prefix}\x1b[0m`;
      const outEvent = `\x1b[${color}m${event.padEnd(16)}\x1b[0m`;
      const outData = isJson ? `\n${JSON.stringify(data, null, 2)}` : data;
      // eslint-disable-next-line no-console
      console.log(outName, outEvent, outData || "");
    }
  },
  success(event, message) {
    this.log(colors.green, event, message);
  },
  warning(event, message) {
    this.log(colors.yellow, event, message);
  },
  info(event, message) {
    this.log(colors.blue, event, message);
  },
  debug(message) {
    this.log(colors.magenta, "debug", message);
  },
  error(event, message, err) {
    this.log(colors.red, event, message, true);
    const errInfo = `"${err.message}" in file ${err.file} in line ${err.line}.`;
    this.debug(errInfo);
  }
};

module.exports = { colors, cli };
