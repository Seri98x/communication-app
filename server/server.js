// server.js or app.js

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs').promises;
const app = express();
const port = 3000;
const twilio = require('twilio');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const cors = require('cors');
const {voiceResponse,tokenGenerator} =  require('./helper');
const $ = require('jquery'); // Import jQuery here
const axios = require('axios'); // Import axios





let auths = [];
let messages = [];

let device;
let token;


const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', ws => {
    console.log('WebSocket connection established');
    ws.on('message', message => {
        console.log('Received:', message);
    });
});
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
const accountSid = 'ACeb4a616a31d55af05478c9e5c8d048e5'; // Replace with your Twilio Account SID
const authToken = '6f8d4324a010835220a996ffc7869a23';   // Replace with your Twilio Auth Token
const twilioNumber = '+12173936128'; // Replace with your Twilio phone number

const client = twilio(accountSid, authToken);


const { authorize } = require('./auth');
const {  sendEmail } = require('./emailService');
const { getMails,getMailMessage,getAttachment} = require('./gmailService');

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors()); // Enable CORS



app.get('/api/update-credentials', async (req, res) => {
    await updateCredentials();
    res.send('Credentials updated successfully');
});


async function startupClient() {

    try {
     const tokenGet = tokenGenerator();
      token = tokenGet.token;
      intitializeDevice();
    } catch (err) {
      console.log(err);

    }
  }

function intitializeDevice() {
    device = new Twilio.Device(token, {
      logLevel:1,
      // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
      // providing better audio quality in restrained network conditions.
      codecPreferences: ["opus", "pcmu"],
    });

    addDeviceListeners(device);

    // Device must be registered in order to receive incoming calls
    device.register();
  }


  function addDeviceListeners(device) {
    device.on("registered", function () {
    });

    device.on("error", function (error) {
    });

    device.on("incoming", handleIncomingCall);

  }


  async function makeOutgoingCall() {
    var params = {
      // get the phone number to call from the DOM
      To: phoneNumberInput.value,
    };

    if (device) {

      // Twilio.Device.connect() returns a Call object
      const call = await device.connect({ params });
      outgoingCallHangupButton.onclick = () => {
        call.disconnect();
      };

    } else {
    }
  }


  app.post('/api/initiate-device', async (req, res) => {
    await startupClient();
    res.send('Device initialized');
  });

  app.post('/api/make-call', async (req, res) => {
    const { phoneNumber } = req.body;
    makeOutgoingCall(phoneNumber);   
});




app.get('/api/get-token', (req, res) => {
    token = tokenGenerator();
    res.json({ token });


    });





    app.get('/api/messages', async (req, res) => {
        try {
            const messages = await client.messages.list({
                to: twilioNumber, // Filter messages where 'to' is your Twilio number
                limit: 20 // Adjust the number of messages as needed
            });
    
            const formattedMessages = await Promise.all(messages.map(async (message) => {
                // Fetch media for each message
                const mediaList = await client.messages(message.sid).media.list();
                const mediaUrls = mediaList.map(media => media.uri);
    
                return {
                    from: message.from,
                    to: message.to,
                    body: message.body,
                    timestamp: message.dateCreated.toISOString(), // Convert to ISO string
                    media: mediaUrls // List of media URLs
                };
            }));
    
            res.json(formattedMessages);
        } catch (error) {
            console.error('Error fetching messages from Twilio:', error);
            res.status(500).send('Error fetching messages');
        }
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

app.post('/api/send-sms', async (req, res) => {
    const { to, body,mediaUrl } = req.body;

    try {
        const message = await client.messages.create({
            body,
            from: twilioNumber,
            to,
            mediaUrl: mediaUrl
        });

        res.json(message);
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).send('Error sending SMS');
    }
});


app.post('/api/sms', (req, res) => {
    const from = req.body.From;
    const to = req.body.To;
    const body = req.body.Body;
    
    // Get the current date and time
    const timestamp = new Date().toISOString(); // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ

    // Store the message
    messages.push({ from, to, body, timestamp });

    // Notify all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ from, to, body, timestamp }));
        }
    });

    res.send('<Response><Message>Thank you for your message!</Message></Response>');
});


app.post('/api/incoming-call', (req, res) => {
    const { From, To, CallSid } = req.body;

    console.log(`Incoming call from: ${From}`);
    console.log(`To: ${To}`);
    console.log(`Call SID: ${CallSid}`);

    // Generate TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    // Example prompt: say a message and gather input
    twiml.say('Hello! Thank you for calling. Please press 1 to proceed or 2 to leave a message.');

    // Gather user input (optional)
    const gather = twiml.gather({
        numDigits: 1,
        action: '/api/process-input'  // Endpoint to handle user input
    });
    
    gather.say('Please make a selection.');

    // If no input is received, redirect to the same endpoint to ask again
    twiml.redirect('/api/incoming-call');

    // Set content type and send TwiML response
    res.type('text/xml');
    res.send(twiml.toString());
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

app.post("/api/voice", (req, res) => {
    console.log(req.body);
    res.set("Content-Type", "text/xml");
    res.send(voiceResponse(req.body));
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

app.use(express.static(path.join(__dirname, '../www')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../www/index.html'));
});


const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);

});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
    });
});