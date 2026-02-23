#!/usr/bin/env node

import { Command } from "commander";
import { refold } from "./refold.js";

const program = new Command();

program
    .name("foldup")
    .description("LLM-powered repo architecture analyzer")
    .version("1.0.0")

program
  .command("refold [folder]")
  .description("Reorganize repository structure")
  .option(
    "-p, --prompt <text>",
    "Additional instruction to guide the reorganization"
  )
  .action(async (folder, options) => {
    await refold(folder, { additionalPrompt: options.prompt });
  });

program.parse()