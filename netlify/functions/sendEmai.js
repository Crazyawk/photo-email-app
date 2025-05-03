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
      to: 'crazyhawk124@gmail.com',          // change this
      from: 'ahmedmuh29@7hills.org',  // verified in SendGrid
      subject: 'Security Warning',
      text: 'Someone has gained access to my iPad!',
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
