const fs = require('fs')
const util = require('util')
const mkdirp = require('mkdirp')

const access = util.promisify(fs.access)
const copy = util.promisify(fs.copyFile)
const mkdir = util.promisify(mkdirp)
const read = util.promisify(fs.readFile)
const readDir = util.promisify(fs.readdir)
const unlink = util.promisify(fs.unlink)
const write = util.promisify(fs.writeFile)

module.exports = {
  access,
  copy,
  mkdir,
  read,
  readDir,
  unlink,
  write
}
