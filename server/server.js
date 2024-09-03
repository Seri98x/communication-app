// server.js or app.js

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs').promises;
const app = express();
const port = 3001;

let auths = [];
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const { authorize } = require('./auth');
const {  sendEmail } = require('./emailService');
const { getMails,getMailMessage,getAttachment} = require('./gmailService');

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../www')));

app.get('/api/update-credentials', async (req, res) => {
    await updateCredentials();
    res.send('Credentials updated successfully');
});

app.get('/oauth2callback', async (req, res) => {
    const { code, clientId, clientSecret, redirectUris, userId } = req.query;

    if (!code || !clientId || !clientSecret || !redirectUris || !userId) {
        return res.status(400).send('Missing required parameters');
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUris.split(',')[0] 
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        userCredentials.push({
            userId,
            token: tokens,
            oauth2Client
        });

        res.redirect('/home');
    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        res.status(500).send('Authorization failed');
    }
});

app.post('/api/authenticate', async (req, res) => {
    const { userId } = req.body;

    // Check if the userId already exists in the auths array
    const existingAuth = auths.find(auth => auth.userId === userId);

    if (!existingAuth) {
        try {
            // Authorize the user and add to auths array if not already present
            const auth = await authorize(userId);
            auths.push({ userId: userId, auth: auth });

            // Send a success response
            return res.json({ userId: userId, auth: auth });
        } catch (error) {
            // Handle potential errors
            return res.status(500).json({ message: 'Error during authentication', error: error.message });
        }
    }

    // If userId exists, just end the request
    return res.json({ message: 'User already authenticated' });
});


app.get('/api/try-list', async (req, res) => {
    try {

        const { userId } = req.query;


        // const { authEntry } = auths.find(auth => auth.userId === userId);
  
        // const authEntry = auths.find(auth => auth.userId === userId);
        // const { auth } = authEntry; 
        // console.log(auth);
        const authz = await authorize(userId);
        const allMails = await getMails(authz);
       

        if (!allMails || allMails.length === 0) {
            return res.status(404).send('No messages found');
        }

        const messages = await Promise.all(
            allMails.map(async ({ id }) => {
                try {
                    return await getMailMessage(authz, id);
                } catch (error) {
                    console.error(`Error retrieving message ${id}:`, error);
                    return null;
                }
            })
        );

        const filteredMessages = messages.filter(msg => msg !== null);
        res.json(filteredMessages);
    } catch (error) {
        console.error('Error in /api/try-list:', error);
        res.status(500).send('Error occurred');
    }
    });
app.get('/api/check-auth', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

app.get('/api/get-attachments', async (req, res) => {
    const { userId,messageId,attachmentId } = req.query;
    const authz = await authorize(userId);

    try {
        const attachments = await getAttachment(authz, messageId,attachmentId);
        res.json(attachments);
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).send('Failed to fetch attachments');
    }
});

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

// Updated route to send an email with optional attachments
app.post('/api/send-email', async (req, res) => {
    const { user, pass, from, to, subject, text, html, attachments } = req.body;

    if (!user || !pass || !from || !to || !subject || !text || !html) {
        return res.status(400).json('Missing required fields');
    }

    try {
        await sendEmail({ user, pass, from, to, subject, text, html, attachments });
        res.status(200).json('Email sent successfully');
        
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
