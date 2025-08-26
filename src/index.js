#!/usr/bin/env node

import { Command } from 'commander';
import { loadLoginCommand, loadActivationCommands } from '#commands/index.js';
import packageJson from '../package.json' with { type: 'json' };

const program = new Command();

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version, '-V, --version', 'output the current version');

loadLoginCommand(program)
loadActivationCommands(program)

// Parse the command-line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}