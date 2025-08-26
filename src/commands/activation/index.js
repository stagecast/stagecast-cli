import { command as loadActivationListCommand } from './list.js';
import { command as loadActivationUploadCommand } from './upload.js';

export const command = (program) => {
  const activationCommand = program.command('activation')
  loadActivationUploadCommand(activationCommand)
  loadActivationListCommand(activationCommand)
}

