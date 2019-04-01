const path = require("path");

const mdssSrcDir = path.resolve(__dirname, "..", "..", "src");
const mdssConfigDir = path.resolve(mdssSrcDir, "config");
const defaultConfigDir = "mdss/config";
const defaultOutputDir = "mdss/dist";

module.exports = {
  mdssSrcDir,
  mdssConfigDir,
  defaultConfigDir,
  defaultOutputDir
};
