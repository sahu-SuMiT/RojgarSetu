const nodemailer = require('nodemailer');

// Use Ethereal for all outgoing mail in development/testing
let emailTransportPromise = nodemailer.createTestAccount().then((testAccount) => {
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
});

// Helper to send mail and log preview URL
module.exports.emailTransport = {
  sendMail: async function (mailOptions) {
    const transport = await emailTransportPromise;
    const info = await transport.sendMail(mailOptions);
    console.log('Ethereal email sent. Preview URL:', nodemailer.getTestMessageUrl(info));
    return info;
  }
};
