const {google} = require('googleapis');
const nodemailer = require('nodemailer');

async function getMails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    
    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            labelIds: ['INBOX'],
            q: 'is:inbox -in:sent'  // Optional: Adjust this number as needed
        });

        // Check if res.data.messages exists and is an array
        const mails = Array.isArray(res.data.messages) ? res.data.messages : [];

        return mails;
    } catch (error) {
        console.error('Error fetching mails:', error);
        return [];  // Return an empty array in case of an error
    }
}



// async function getMailMessage(auth, messageId) {
//     const gmail = google.gmail({ version: 'v1', auth });

//     // Fetch the message using the Gmail API
//     const res = await gmail.users.messages.get({
//         userId: 'me',
//         id: messageId,
//         format: 'full'  // Request the full message data, including attachments
//     });

//     // Log the complete message object
//     console.log(res.data);

//     // Extract headers
//     const headers = res.data.payload.headers;

//     // Get the subject, sender, and date from headers
//     const subjectHeader = headers.find(header => header.name === 'Subject');
//     const fromHeader = headers.find(header => header.name === 'From');
//     const dateHeader = headers.find(header => header.name === 'Date');

//     const subject = subjectHeader ? subjectHeader.value : 'No Subject';
//     const sender = fromHeader ? fromHeader.value : 'No Sender';
//     const date = dateHeader ? dateHeader.value : 'No Date';

//     // Extract the body
//     let body = '';
//     if (res.data.payload.mimeType === 'text/plain') {
//         const base64EncodedData = res.data.payload.body.data;
//         const base64 = base64EncodedData.replace(/-/g, '+').replace(/_/g, '/');
//         body = Buffer.from(base64, 'base64').toString('utf-8');
//     } else if (res.data.payload.mimeType === 'text/html') {
//         // Handle HTML bodies
//         const base64EncodedData = res.data.payload.body.data;
//         const base64 = base64EncodedData.replace(/-/g, '+').replace(/_/g, '/');
//         body = Buffer.from(base64, 'base64').toString('utf-8');
//     }

//     // Extract attachments and their IDs
//     const attachments = [];
//     const attachmentIds = [];  // To store attachment IDs
//     const parts = res.data.payload.parts || [];
//     for (const part of parts) {
//         if (part.filename && part.body && part.body.attachmentId) {
//             attachmentIds.push(part.body.attachmentId);  // Collect attachment IDs

//             const attachment = await gmail.users.messages.attachments.get({
//                 userId: 'me',
//                 messageId: messageId,
//                 id: part.body.attachmentId
//             });
          
//             const attachmentData = attachment.data.data.replace(/-/g, '+').replace(/_/g, '/');
//             const decodedAttachment = Buffer.from(attachmentData, 'base64').toString('utf-8'); // Adjust the decoding based on attachment type
//             attachments.push({
//                 filename: part.filename,
//                 mimeType: part.mimeType,
//                 data: attachment.data.data
//             });
//         }
//     }

//     // Return the extracted details, body, attachments, attachment IDs, and messageId
//     return {
//         messageId,  // Include the messageId in the returned object
//         subject,
//         sender,
//         date,
//         body,
//         attachments,
//         attachmentIds  // Return the collected attachment IDs
//     };
// }




async function getInboxMessages(auth) {
    const gmail = google.gmail({ version: 'v1', auth });

    // List messages in the inbox
    const res = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'],
        q: 'is:inbox -in:sent'   // Filter to only include messages in the inbox
    });

    // Extract message IDs
    const messages = res.data.messages || [];
    const messageIds = messages.map(message => message.id);

    // Fetch details of each message
    const messageDetails = [];
    for (const messageId of messageIds) {
        const messageDetail = await getMailMessage(auth, messageId);
        messageDetails.push(messageDetail);
    }

    return messageDetails;
}

async function getMailMessage(auth, messageId) {
    const gmail = google.gmail({ version: 'v1', auth });

    // Fetch the message using the Gmail API
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
        labelIds: ['INBOX'],
        q: 'is:inbox -in:sent'  // Request the full message data, including attachments
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
    let plainTextBody = '';
    
    if (res.data.payload.mimeType === 'text/plain' || res.data.payload.mimeType === 'text/html') {
        const base64EncodedData = res.data.payload.body.data;
        const base64 = base64EncodedData.replace(/-/g, '+').replace(/_/g, '/');
        body = Buffer.from(base64, 'base64').toString('utf-8');
    }

    // Extract attachments and their IDs
    const attachments = [];
    const attachmentIds = [];  // To store attachment IDs
    const parts = res.data.payload.parts || [];
    
    for (const part of parts) {
        // Check if part has mimeType "text/plain"
        if (part.mimeType === 'text/plain') {
            const encoding = part.headers.find(header => header.name === 'Content-Transfer-Encoding')?.value;
            const data = part.body.data;
            
            
                plainTextBody = Buffer.from(data, 'base64').toString('utf-8');
            
        }

        if (part.filename && part.body && part.body.attachmentId) {
            attachmentIds.push(part.body.attachmentId);  // Collect attachment IDs

            const attachment = await gmail.users.messages.attachments.get({
                userId: 'me',
                messageId: messageId,
                id: part.body.attachmentId,
                q: 'is:inbox -in:sent',
                labelIds: ['INBOX'] 
            });

            const attachmentData = attachment.data.data.replace(/-/g, '+').replace(/_/g, '/');
            const decodedAttachment = Buffer.from(attachmentData, 'base64').toString('utf-8'); // Adjust the decoding based on attachment type
            attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                data: attachment.data.data  // Adjusted decoding
            });
        }
    }

    // Return the extracted details, body, attachments, attachment IDs, parts, and plainTextBody
    return {
        messageId,  // Include the messageId in the returned object
        subject,
        sender,
        date,
        body,
        attachments,
        attachmentIds,  // Return the collected attachment IDs
        parts,  // Return the parts of the email
        plainTextBody  // Return the decoded body of the part with mimeType "text/plain"
    };
}

  async function getAttachment(auth, messageId,attachmentId) {
    try {
        // Initialize the Gmail API client
        const gmail = google.gmail({ version: 'v1', auth });

        // Fetch the attachment
        const res = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: messageId,
            id: attachmentId
        });

        // Return the attachment data
        return res.data;
    } catch (error) {
        console.error('Error fetching attachment:', error);
        throw error; // Rethrow error for further handling if necessary
    }
}
  

module.exports = { getMails,getMailMessage,getAttachment };



