#!/usr/bin/env node

const program = require("commander");

program
  .description("CLI for creating MDSS stylesheets")
  .usage("<command> [options]")
  .command("build", "Generate MDSS stylesheets")
  .alias("b")
  .command("init", "Set up MDSS for customization")
  .alias("i")
  .parse(process.argv);
