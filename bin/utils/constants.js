const { resolve, posix } = require("path");

const defaults = {};
defaults.configPath = posix.join("mdss", "config");
defaults.outputPath = posix.join("mdss", "dist");

const mdss = {};
mdss.configFile = "mdss.json";
mdss.sourcePath = resolve(__dirname, "..", "..", "src");
mdss.configPath = posix.join(mdss.sourcePath, "config");

module.exports = { defaults, mdss };
