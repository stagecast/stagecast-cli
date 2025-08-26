import inquirer from 'inquirer';
import axios from 'axios';
import stagecast_config from '../config.js'

import { loadExistingToken, saveTokenLocally } from '#utils/index.js';

export const loginAction = async (options) => {
  const { env, force, silent } = options;
  console.log(`Attempting to log in ${env}...`);

  const cachedToken = force ? false : loadExistingToken(env);

  // Check if token is already cached
  if (cachedToken) {
    console.log(`Auth token loaded (${env}).`);
    !silent && console.log(`export STAGECAST_TOKEN="${cachedToken}"`);
    return cachedToken;
  }

  // Interactive prompts for credentials
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      validate: (input) => input ? true : 'Email cannot be empty',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      mask: '*',
      validate: (input) => input ? true : 'Password cannot be empty',
    },
  ]);

  const { email, password } = answers;
  const loginUrl = stagecast_config.environments[env].api_endpoint + '/api/login';

  try {
    const response = await axios.post(loginUrl, { email, password });

    if (response.status === 200 && response.data.token) {
      const token = response.data.token;
      saveTokenLocally({ env, token })
      console.log(`export STAGECAST_TOKEN="${token}"`);
      return token;
    } else {
      console.error('Login failed: Invalid response from server.');
    }
  } catch (error) {
    if (error.response) {
      console.error(`Login failed: ${error.response.data.message || error.response.statusText}`);
    } else {
      console.error(`Login failed: ${error.message}`);
    }
  }
}

export const command = (program) => {
  program
    .command('login')
    .description('Login into stagecast console')
    .option('--env <environment>', 'Specify the environment (e.g., staging)', 'staging')
    .option('-f, --force', 'Ignore cached values.')
    .option('-s, --silent', 'Avoid logging.')
    .action(loginAction);
}
