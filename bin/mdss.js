#!/usr/bin/env node

const program = require("commander");

// Script description

program
  .description("CLI for building and customizing MDSS")
  .usage("<command> [options]")
  .command("build", "Generate custom MDSS stylesheets")
  .alias("b")
  .command("init", "Initialize MDSS for customization")
  .alias("i")
  .parse(process.argv);
