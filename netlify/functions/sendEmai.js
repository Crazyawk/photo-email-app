const sgMail = require('@sendgrid/mail');
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');
const path = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async () => {
  const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN, fetch });

  try {
    const files = await dbx.filesListFolder({ path: '/photo' });
    const attachments = [];

    for (const file of files.result.entries) {
      if (file['.tag'] !== 'file') continue;

      const res = await dbx.filesDownload({ path: file.path_display });
      const buffer = Buffer.from(res.result.fileBinary);

      attachments.push({
        content: buffer.toString('base64'),
        filename: res.result.name,
        type: 'application/octet-stream',
        disposition: 'attachment',
      });
    }

    await sgMail.send({
      to: 'RECIPIENT@example.com',          // change this
      from: 'VERIFIED_SENDER@example.com',  // verified in SendGrid
      subject: 'Files from Dropbox',
      text: 'Attached are your Dropbox files.',
      attachments
    });

    return {
      statusCode: 200,
      body: 'Email sent successfully!',
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Failed to send email: ' + error.message,
    };
  }
};
