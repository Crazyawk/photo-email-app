{\rtf1\ansi\ansicpg1252\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const sgMail = require('@sendgrid/mail');\
const \{ Dropbox \} = require('dropbox');\
const fetch = require('node-fetch');\
const path = require('path');\
\
sgMail.setApiKey(process.env.SENDGRID_API_KEY);\
\
exports.handler = async () => \{\
  const dbx = new Dropbox(\{ accessToken: process.env.DROPBOX_TOKEN, fetch \});\
\
  try \{\
    const files = await dbx.filesListFolder(\{ path: '/photo' \});\
    const attachments = [];\
\
    for (const file of files.result.entries) \{\
      if (file['.tag'] !== 'file') continue;\
\
      const res = await dbx.filesDownload(\{ path: file.path_display \});\
      const buffer = Buffer.from(res.result.fileBinary);\
\
      attachments.push(\{\
        content: buffer.toString('base64'),\
        filename: res.result.name,\
        type: 'application/octet-stream',\
        disposition: 'attachment',\
      \});\
    \}\
\
    await sgMail.send(\{\
      to: 'RECIPIENT@example.com',          // change this\
      from: 'VERIFIED_SENDER@example.com',  // verified in SendGrid\
      subject: 'Files from Dropbox',\
      text: 'Attached are your Dropbox files.',\
      attachments\
    \});\
\
    return \{\
      statusCode: 200,\
      body: 'Email sent successfully!',\
    \};\
  \} catch (error) \{\
    console.error(error);\
    return \{\
      statusCode: 500,\
      body: 'Failed to send email: ' + error.message,\
    \};\
  \}\
\};\
}