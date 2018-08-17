#!/usr/bin/env node

const program = require('commander')

// Script description

program
  .description('CLI for building and customizing MDSS')
  .usage('<command> [options]')
  .command('build', 'Generate custom MDSS stylesheets').alias('b')
  .command('customize', 'Set up MDSS for customization').alias('c')
  .parse(process.argv)
