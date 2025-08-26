import chalk from 'chalk';

export const loadAction = async () => {
  console.log(chalk.green.bold('\n🎭 Stagecast CLI Loaded Successfully!\n'));
  console.log(chalk.cyan('Your project is running on the stagecast cli.'));
  console.log(chalk.cyan('The cli is a work in progress, but it will make its best to help you upload and manage your activations.\n'));
  
  console.log(chalk.cyan('\nFor general help, use:'));
  console.log(chalk.white('  stagecast-cli --help'));
  console.log(chalk.cyan(''));
}

export const command = (program) => {
  program
    .command('load')
    .description('Show that stagecast-cli is loaded and display available commands')
    .action(loadAction);
}
