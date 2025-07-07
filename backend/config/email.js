const nodemailer = require('nodemailer');
module.exports.emailTransport = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'welcome@rojgarsetu.org',
    pass: 'Rojgar@setu'
  }
});

module.exports.emailSender = 'welcome@rojgarsetu.org';
