const fs = require("fs");
const util = require("util");
const mkdirp = require("mkdirp");

const accessFile = util.promisify(fs.access);
const copyFile = util.promisify(fs.copyFile);
const createDir = util.promisify(mkdirp);
const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);
const deleteFile = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

module.exports = {
  accessFile,
  copyFile,
  createDir,
  readFile,
  readDir,
  deleteFile,
  writeFile
};
