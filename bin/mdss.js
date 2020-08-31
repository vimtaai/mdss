#!/usr/bin/env node

import Commander from "commander";

const program = new Commander.Command();

program
  .description("CLI for building and customizing MDSS")
  .usage("<command> [options]")
  .command("build", "Generate custom MDSS stylesheets")
  .alias("b")
  .command("customize", "Set up MDSS for customization")
  .alias("c")
  .parse(process.argv);
