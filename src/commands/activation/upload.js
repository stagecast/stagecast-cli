import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { rimrafSync } from 'rimraf';

import { sleep, zipDirectory, getNameFromManifest } from '#utils/index.js';
import { loginAction } from '../login.js';
import { activationAction } from './list.js';

import stagecast_config from '../../config.js';
const tmpDirPath = path.join(path.resolve(), 'tmp');
const archivePath = path.join(path.resolve(), 'archive.zip');

// will prevent some folders from being copied in the src folder
const copyOptions = {
  recursive: true,
  filter: function (filename) {
    const blacklist = stagecast_config.ignored_files || [];
    for (let i = 0; i < blacklist.length; i++) {
      if (blacklist[i].test(filename)) {
        return false;
      }
    }
    return true;
  }
}

const customReadFileSync = (fileName) => {
  if (!fileName || fileName.startsWith('_')) return false;
  
  const data = fs.readFileSync(fileName);
  return JSON.parse(data.toString());
}

const getEnvConfig = (env) => {
  if (!env) return;

  return {
    apiEndpoint: stagecast_config.environments[env].api_endpoint,
    cdn: stagecast_config.environments[env].content_upload_endpoint,
  }
}

const checkOptions = async ({ env, folderName }) => {
  const envConfig = getEnvConfig(env)

  if (!envConfig) {
    console.warn("Failed to load environment config.");
    console.warn("Exit with code 1");
    process.exit(1);
  }

  const token = await loginAction({ env, silent: true });
  if (!token) {
    console.warn("Failed to get token.");
    console.warn("Exit with code 1");
    process.exit(1);
  }

  if (!folderName) {
    console.warn("Folder name is missing. You need to specify an activation to be uploaded");
    process.exit(1);
  }

  const basePath = path.join(process.cwd(), folderName);
  
  return { env, envConfig, folderName, basePath, token };
}

const createArchive = async (activationManifest, enrichedOptions) => {
  const { basePath } = enrichedOptions;
  
  validateConfigFile(path.join(basePath, 'config/mobile.config.json'));
  validateConfigFile(path.join(basePath, 'config/results.config.json'));
  validateConfigFile(path.join(basePath, 'config/default.staging.json'), true);
  validateConfigFile(path.join(basePath, 'config/default.production.json'), true);
  
  // create dir
  if (!fs.existsSync(tmpDirPath)) {
    fs.mkdirSync(tmpDirPath);
  } 

  fs.writeFileSync(
    path.join(tmpDirPath, "manifest.json"), 
    JSON.stringify(activationManifest, null, 0), 
    'utf-8'
  );

  // TODO: move this to an external config
  const checkIfTheseFilesExist = ['src', 'config', 'assets'];

  try {
    fs.cpSync(path.join(basePath), path.join(tmpDirPath), copyOptions);
  } catch (error) {
    throw new Error(`Failed to copy data into temp folder. ${error?.message}`)
  }

  try {
    // zip temporary forder
    await zipDirectory(tmpDirPath, archivePath);
    // remove temporary copy folder
    rimrafSync(tmpDirPath);
    return archivePath;
  } catch (error) {
    throw new Error(`Failed to zip and remove the temporary folder. ${error?.message}`)
  }
}

const uploadLocalArchive = async (archivePath, enrichedOptions) => {
  const { envConfig: { apiEndpoint }, token } = enrichedOptions;
  try {
    const archive = fs.readFileSync(archivePath);
    console.log(`Uploading archive...`);
    const result = await axios.post(`${apiEndpoint}/api/archives/`, archive, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': 'Bearer ' + token
      }
    });
    console.log(`Archive uploaded!`);
    return result;
  } catch(error) {
    return null;
  }
}

const removeLocalArchive = (archivePath) => {
  try {
    fs.unlinkSync(archivePath);
  } catch (err) {
    throw new Error(`Error while removing temporary archive. ${err?.message}`)
  }
}

const validateConfigFile = (fileName, checkContent) => {
  if (!fs.existsSync(fileName)) {
    return `${fileName} missing. Make sure to include it in your config folder.`;
  } 
  try {
    const c = customReadFileSync(fileName);
    if (checkContent) {
      return c.custom ? null : `Value 'custom' is missing in file ${fileName}. Have you set the Template custom object defaults?`;
    }
  } catch (err) {
    throw new Error(`Error while reading the file ${fileName}. Check the JSON structure.`);
  }
}

const readManifestFile = (manifestFile) => {
  let activationManifest;
  try {
    activationManifest = customReadFileSync(manifestFile);
    console.log('Activation to upload:')
    console.table([{ 
        name: getNameFromManifest(activationManifest),
        bundleId: activationManifest.bundleId,
        version: activationManifest.version,
      }], 
      ['name', 'version', 'bundleId']
    );
  } catch (err) {
    console.error('No manifest file found. Did you specify the manifest.json file in the root folder? Aborting.');
    process.exit(1);
  }
  return activationManifest;
}

const execActivationZipAndUpload = async (enrichedOptions) => {
  await cleanAll();
  await sleep(2000);

  try {
    const activationManifest = readManifestFile(path.join(enrichedOptions.basePath, 'manifest.json'));
    const archiveLocation = await createArchive(activationManifest, enrichedOptions);
    const uploadResult = await uploadLocalArchive(archiveLocation, enrichedOptions);
    await removeLocalArchive(archiveLocation);
    await activationAction({ env: enrichedOptions.env, name: getNameFromManifest(activationManifest) });

    if (uploadResult) return console.log('All done. Exit.');
    throw new Error('The process could not finish correctly.')

  } catch (error) {
    console.log(error.message);
    // await cleanAll();
    process.exit(1);
  }
}

async function cleanAll() {
  try {
    rimrafSync(tmpDirPath);
  } catch (err) {}
  try {
    await removeLocalArchive(archivePath);
  } catch (err) {}
}

async function stopSignalHandler() {
  try {
    await cleanAll({ tmpDirPath, archivePath });
    process.exit(1);
  } catch (err) {}
}

process.on('SIGINT', stopSignalHandler);
process.on('SIGTERM', stopSignalHandler);


const uploadAction = async (options) => {
  const enrichedOptions = await checkOptions(options);
  await execActivationZipAndUpload(enrichedOptions);
}

export const command = (program) => {
  program
    .command('upload')
    .description('Upload an activation')
    .option('--env <environment>', 'Specify the environment (e.g., staging)', 'staging')
    .option('--folderName, -n <name>', 'Specify the activation name', '')
    .option('--local', 'Should upload from local folder or from remote repository', '')
    .action(uploadAction);
}