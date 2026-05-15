const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.ai-interview.id.vn',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'no-reply@ai-interview.id.vn',
    pass: 'Binhaz19.',
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
  logger: true,
  debug: true
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});
