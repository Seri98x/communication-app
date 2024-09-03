// gmailService.js

const nodemailer = require('nodemailer');

/**
 * Sends an email with optional attachments.
 * @param {Object} params - The email parameters.
 * @param {string} params.user - The email account username.
 * @param {string} params.pass - The email account password.
 * @param {string} params.from - The sender's email address.
 * @param {string} params.to - The recipient's email address.
 * @param {string} params.subject - The subject of the email.
 * @param {string} params.text - The plain text body of the email.
 * @param {string} params.html - The HTML body of the email.
 * @param {Array} [params.attachments] - An array of attachment objects.
 */
const sendEmail = async ({ user, pass, from, to, subject, text, html, attachments = [] }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: user,
            pass: pass
        },
    });

    const mailOptions = { 
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments // Adding attachments
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        
    } catch (error) {
       
        
    }
};

module.exports = { sendEmail };
