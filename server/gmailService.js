const {google} = require('googleapis');

// async function getMails(auth) {
//     const gmail = google.gmail({version: 'v1', auth});
//     const res = await gmail.users.messages.list({
//         userId: 'me',
//     });  
//     console.log(res.data);
//     const lables = res.data.labels;
//     if (!lables || lables ==0){
//         console.log('No labels found.');
//         return;
//     }

//     console.log('Labels:');
//     lables.forEach((label) => {
//         console.log(label.name);
//     });
//     return lables;
// }



async function sendEmail(auth, { to, subject, message, attachment }) {
  const gmail = google.gmail({ version: 'v1', auth });

  // Define boundary for MIME multipart message
  const boundary = '----=_Part_123456_78901234.56789012';

  // Construct the email body
  let rawMessageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    '',
    message
  ];

  if (attachment) {
    // Convert attachment to base64
    const attachmentBase64 = attachment.buffer.toString('base64');

    // Add attachment part
    rawMessageParts.push(
      `--${boundary}`,
      `Content-Type: application/octet-stream`,
      `Content-Disposition: attachment; filename="${attachment.originalname}"`,
      `Content-Transfer-Encoding: base64`,
      '',
      attachmentBase64
    );
  }

  // End of multipart message
  rawMessageParts.push(`--${boundary}--`);

  const rawMessage = rawMessageParts.join('\n');
  const encodedMessage = Buffer.from(rawMessage).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Send the email
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  });

  return res.data;
}

// Example usage:
// const auth = ...; // Your OAuth2 client
// const content = {
//   to: 'recipient@example.com',
//   subject: 'Subject Here',
//   message: 'Email body here',
//   attachment: {
//     buffer: Buffer.from('File content here'), // Buffer of the file
//     originalname: 'file.txt' // Original file name
//   }
// };
// sendEmail(auth, content).then(console.log).catch(console.error);

async function getMails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
  
    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10 // Adjust as needed
      });
  
      // Ensure response.data.messages is an array
      return Array.isArray(response.data.messages) ? response.data.messages : [];
    } catch (error) {
      console.error('Error retrieving messages:', error);
      throw error;
    }
  }
  

  async function getMailMessage(auth, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });
  
    // Fetch the message using the Gmail API
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'  // Request the full message data, including attachments
    });
  
    // Log the complete message object
    console.log(res.data);
  
    // Extract headers
    const headers = res.data.payload.headers;
  
    // Get the subject, sender, and date from headers
    const subjectHeader = headers.find(header => header.name === 'Subject');
    const fromHeader = headers.find(header => header.name === 'From');
    const dateHeader = headers.find(header => header.name === 'Date');
  
    const subject = subjectHeader ? subjectHeader.value : 'No Subject';
    const sender = fromHeader ? fromHeader.value : 'No Sender';
    const date = dateHeader ? dateHeader.value : 'No Date';
  
    // Extract the body
    let body = '';
    if (res.data.payload.mimeType === 'text/plain') {
      const base64EncodedData = res.data.payload.body.data;
      const base64 = base64EncodedData.replace(/-/g, '+').replace(/_/g, '/');
      body = Buffer.from(base64, 'base64').toString('utf-8');
    } else if (res.data.payload.mimeType === 'text/html') {
      // Handle HTML bodies
      const base64EncodedData = res.data.payload.body.data;
      const base64 = base64EncodedData.replace(/-/g, '+').replace(/_/g, '/');
      body = Buffer.from(base64, 'base64').toString('utf-8');
    }
  
    // Extract attachments
    const attachments = [];
    const parts = res.data.payload.parts || [];
    for (const part of parts) {
      if (part.filename && part.body && part.body.attachmentId) {
        const attachment = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: messageId,
          id: part.body.attachmentId
        });
        const attachmentData = attachment.data.data.replace(/-/g, '+').replace(/_/g, '/');
        const decodedAttachment = Buffer.from(attachmentData, 'base64').toString('utf-8'); // Adjust the decoding based on attachment type
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          data: decodedAttachment
        });
      }
    }
  
    // Return the extracted details, body, and attachments
    return {
      subject,
      sender,
      date,
      body,
      attachments
    };
  }
module.exports = {
    getMails: getMails,
    sendEmail: sendEmail,
    getMailMessage: getMailMessage
}