const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const path = require('path');
const fs = require('fs').promises; // Use fs.promises for async file operations

const SCOPE = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly'
];

// Paths to token and credentials files
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH2 = path.join(__dirname, 'token2.json');
const CREDENTIALS_PATH2 = path.join(__dirname, 'credentials2.json');

// Load saved credentials if they exist
async function loadSavedCredentialsIfExists(userId) {
  try {
    if(userId === '0')
        {
            const content = await fs.readFile(TOKEN_PATH, 'utf8');
            const credentials = JSON.parse(content);
        
            return google.auth.fromJSON(credentials);
        }

        else if(userId === '1')
        {
            const content = await fs.readFile(TOKEN_PATH2, 'utf8');
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        }
 
  } catch (err) {
    return null;
  }
}

// Save credentials to a file
async function saveCredentials(client, userId) {

    if(userId === '0')
        {
            const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
            const keys = JSON.parse(content);
            const key = keys.installed || keys.web;
            const payload = JSON.stringify({
                type: 'authorized_user',
                client_id: key.client_id,
                client_secret: key.client_secret,
                refresh_token: client.credentials.refresh_token
            });
            await fs.writeFile(TOKEN_PATH, payload, 'utf8');
        }
            
            else if(userId === '1')
            {
                const content = await fs.readFile(CREDENTIALS_PATH2, 'utf8');
                const keys = JSON.parse(content);
                const key = keys.installed || keys.web;
                const payload = JSON.stringify({
                    type: 'authorized_user',
                    client_id: key.client_id,
                    client_secret: key.client_secret,
                    refresh_token: client.credentials.refresh_token
                });
                await fs.writeFile(TOKEN_PATH2, payload, 'utf8');
            }
}

// Authorize and get the OAuth2 client
async function authorize(userId) {
  let client = await loadSavedCredentialsIfExists(userId);
  if (client) {
    return client;
  }

  if(userId === '0')
  {
      client = await authenticate({
          scopes: SCOPE,
          keyfilePath: CREDENTIALS_PATH,
      });
  }
    
      else if(userId === '1')
      {
        client = await authenticate({
             scopes: SCOPE,
             keyfilePath: CREDENTIALS_PATH2,
        });
      }

  if (client.credentials) {
    await saveCredentials(client,userId);
  }
  
  return client;
}



module.exports = {
  authorize
};
