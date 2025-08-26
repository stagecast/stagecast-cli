import NodeCache from 'node-cache';
import os from 'os';
import path from 'path';
import fs from 'fs';

import { parseJwt } from './parseJwt.js'

// Initialize Cache with 1 day TTL (86400 seconds)
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

const TOKEN_FILE_PATH = path.join(os.homedir(), '.stagecast_token');

export function loadExistingToken (env) {
  // Load existing token if available
  let cachedToken = cache.get(`${env}-jwt`);
  if (!cachedToken) {
    // Try to read from file
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const data = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
      try {
        const parsed = JSON.parse(data);
        const currentTime = Math.floor(Date.now() / 1000);
        const cached = parsed[env];
        if (cached.expiration > currentTime) {
          cachedToken = cached.token;
          cache.set('jwt', cachedToken, cached.expiration - currentTime);
          console.log('Loading token from cache...');
          return cachedToken;
        } else {
          // Token expired
          fs.unlinkSync(TOKEN_FILE_PATH);
        }
      } catch (e) {
        console.error('Failed to parse token file. It might be corrupted.');
        fs.unlinkSync(TOKEN_FILE_PATH);
      }
    }
  }
}

export function saveTokenLocally ({ env, token }) {
  const decodedToken = parseJwt(token);
  const expiration = decodedToken.exp;

  if (!expiration) {
    throw new Error('Token does not contain an expiration time.')
  }
  
  try {
    // Cache the token
    const currentTime = Math.floor(Date.now() / 1000);
    cache.set(`${env}-jwt`, token, expiration - currentTime);
  
    // Save to file
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify({ [env]: { token, expiration } }), 'utf-8');
    console.log('Token has been cached and will expire in 1 day.');

  } catch (error) {
    throw new Error('Failed to save the token locally.')
  }
}
