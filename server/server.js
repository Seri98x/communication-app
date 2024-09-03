const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { google } = require('googleapis');
const auth = require('./auth'); // Import your auth module
const fs = require('fs').promises; // Use fs.promises for async file operations
const app = express();
const port = 3001;
const { authorize} = require('./auth'); // Correctly destructure the import

const {getMails , sendEmail,getMailMessage} = require('./gmailService');

// Set up multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, '../www')));

// Redirect to Google OAuth2 consent screen
app.get('/auth', (req, res) => {
  const url = auth.getAuthUrl();
  res.redirect(url);
});

const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');


const updateCredentials = async () => {
    const newCredentials = {
      web: {
        client_id: "108205539127-jd3tspjcmfl33o8sca91uqjgmhe84g41.apps.googleusercontent.com",
        project_id: "tonal-griffin-433815-i1",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "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",
        redirect_uris: ["http://localhost:3000/oauth2callback"]
      }
    };
  
    try {
      await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(newCredentials, null, 2), 'utf8');
      console.log('Credentials updated successfully');
    } catch (err) {
      console.error('Error updating credentials:', err);
    }
  };


app.get('/api/update-credentials', async (req, res) => {
    // const { clientId, clientSecret, projectId, redirectUris } = req.body;
  
    // if (!clientId || !clientSecret || !projectId || !redirectUris) {
    //   return res.status(400).send('Missing required fields');
    // }
  
    // const newCredentials = {
    //   web: {
    //     client_id: clientId,
    //     project_id: projectId,
    //     auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    //     token_uri: 'https://oauth2.googleapis.com/token',
    //     auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    //     client_secret: clientSecret,
    //     redirect_uris: [redirectUris]
    //   }
    // };
  
    // try {
    //   await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(newCredentials, null, 2), 'utf8');
    //   res.send('Credentials updated successfully');
    // } catch (err) {
    //   console.error('Error updating credentials:', err);
    //   res.status(500).send('Failed to update credentials');
    // }
    await updateCredentials();
  });


app.get('/api/try-list', async (req, res) => {
    try {
      // Authorize and get OAuth2 client
      const auth = await authorize();
  
      // Fetch the list of email IDs
      const allMails = await getMails(auth);
  
      // Check if getMails returned any messages
      if (!allMails || allMails.length === 0) {
        return res.status(404).send('No messages found');
      }
  
      // Retrieve details for each email ID
      const messages = await Promise.all(
        allMails.map(async ({ id }) => {
          try {
            return await getMailMessage(auth, id);
          } catch (error) {
            console.error(`Error retrieving message ${id}:`, error);
            return null;
          }
        })
      );
  
      const filteredMessages = messages.filter(msg => msg !== null);
  
      // Return the results
      res.json(filteredMessages);
      console.log(filteredMessages);
  
    } catch (error) {
      console.error('Error in /api/try-list:', error);
      res.status(500).send('Error occurred');
    }
  });

// Route to check authentication
app.get('/api/check-auth', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Route to send an email
app.post('/api/send', upload.single('attachment'), async (req, res) => {
  const token = JSON.parse(req.cookies.token || '{}');
  if (!token.access_token) {
    return res.status(401).send('Not authenticated');
  }

  const { to, subject, message } = req.body;
  const attachment = req.file ? req.file.buffer.toString('base64') : '';

  const gmail = google.gmail({ version: 'v1', auth: token.access_token });

  const rawMessageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    message
  ];

  if (attachment) {
    rawMessageParts.push(`--boundary`);
    rawMessageParts.push(`Content-Type: application/octet-stream`);
    rawMessageParts.push(`Content-Disposition: attachment; filename="attachment"`);
    rawMessageParts.push('');
    rawMessageParts.push(attachment);
    rawMessageParts.push('--boundary--');
  }

  const rawMessage = rawMessageParts.join('\n');
  const encodedMessage = Buffer.from(rawMessage).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });
    res.send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
});

// Route to list emails
app.get('/api/list', async (req, res) => {
  const token = JSON.parse(req.cookies.token || '{}');
  if (!token.access_token) {
    return res.status(401).send('Not authenticated');
  }

  const gmail = google.gmail({ version: 'v1', auth: token.access_token });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10
    });
    const messages = response.data.messages;
    res.json(messages);
  } catch (error) {
    console.error('Error listing emails:', error);
    res.status(500).send('Failed to list emails');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
