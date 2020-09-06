#!/usr/bin/env node

import Commander from "commander";

const program = new Commander.Command();

program
  .description("CLI for building and customizing MDSS")
  .usage("<command> [options]")
  .command("build", "Generate custom MDSS stylesheets")
  .alias("b")
  .command("init", "Initilize MDSS for customization")
  .alias("i")
  .parse(process.argv);
