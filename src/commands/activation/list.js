import axios from 'axios';
import stagecast_config from '../../config.js'

export const activationAction = async (options) => {
  const { env, name: activationName } = options;
  const activationUrl = stagecast_config.environments[env].api_endpoint + '/api/templates';

  try {
    // Make POST request to /login endpoint
    const response = await axios.get(activationUrl);

    if (response.status === 200 && response.data) {
      let parsedResponse = response.data;
      if (activationName) {
        parsedResponse = response.data
          .filter(activation => activation.name.split(' ').join('_') === activationName)
      }
      const activations = parsedResponse.map(({ displayName, name, version, created }) => ({
        displayName, 
        name, 
        version, 
        created: new Date(created)
      }));
      console.table(activations, ['created', 'displayName', 'name', 'version']);
    } else {
      console.error('Fetch failed.');
    }
  } catch (error) {
    if (error.response) {
      console.error(`Fetch failed: ${error.response.data.message || error.response.statusText}`);
    } else {
      console.error(`Fetch failed: ${error.message}`);
    }
  }
}

export const command = (program) => {
  program
    .command('list')
    .description('Get info about an activation')
    .option('--env <environment>', 'Specify the environment (e.g., staging)', 'staging')
    .option('-n, --name <value>', 'Specify the activation name (e.g., live-quiz)', '')
    .action(activationAction);
}