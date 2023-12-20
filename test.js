
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const gmail = google.gmail('v1');

// These id's and secrets should come from .env file.
const CLIENT_ID = '399931730160-am587ub5ebckd98mormt29n3va0vhpml.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04bCUqewW0592CgYIARAAGAQSNwF-L9Ir8xClpDrwYpC5X4Gk_MKKV9G7Rw8AViFB8EJc8vX6ZxrumZa5LHfY6QGS6zFVA-eomhs';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'vishnukoyyada03@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'vishnuvardhan <vishnukoyyada03@gmail.com>',
      to: 'vishnukoyyada01@gmail.com',
      subject: 'Hello from gmail using API',
      text: 'Hello from gmail email using API',
      html: '<h1>Hello from gmail email using API</h1>',
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

sendMail()
  .then((result) => console.log('Email sent...', result))
  .catch((error) => console.log(error.message));



async function fetchEmails() {
  const res = await gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'], // You can change the label to fetch emails from
  });

  return res.data.messages || [];
}

async function checkIfReplied(messageId) {
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });
  return res.data.payload && res.data.payload.headers.some(header => header.name === 'In-Reply-To');
}

async function addLabelAndMove(messageId, labelName) {
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    resource: {
      addLabelIds: [labelName],
      removeLabelIds: ['INBOX'], // Remove from the Inbox label
    },
  });
}

async function sendReplyAndLabelEmails() {
  try {
    const emails = await fetchEmails();

    for (const email of emails) {
      const hasReplied = await checkIfReplied(email.id);

      if (!hasReplied) {
        const result = await sendMail();
        console.log('Email sent...', result);

        const labelName = `Label-${Date.now()}`; // Generate a unique label name
        await addLabelAndMove(email.id, labelName);
      }
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    const randomInterval = Math.floor(Math.random() * (120 - 45 + 1)) + 45; // Random interval between 45 to 120 seconds
    setTimeout(sendReplyAndLabelEmails, randomInterval * 1000);
  }
}

sendReplyAndLabelEmails();

/*

Hello just checking with the branches...
*/