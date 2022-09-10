const nodemailer = require('nodemailer');

module.exports = (smtpConfig, msgSubject, msgBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      const projectData = smtpConfig;

      const mailData = {
        host: projectData.host,
        port: projectData.port,
        secure: projectData.secure === '' ? false : projectData.secure
      };

      if (projectData.secure === false && projectData.tls) {
        mailData.tls = projectData.tls;
      }

      if (projectData.auth && projectData.auth.smtp_auth === true) {
        mailData.auth = {
          user: projectData.auth.username,
          pass: projectData.auth.password
        };
      }

      const emailFrom = '<' + smtpConfig.send_email_from.email + '>';

      const recipients = smtpConfig.recipient.split(';').map(x => x.trim()).join(', ');

      const transporter = nodemailer.createTransport(mailData);

      const mailOptions = {
        from: projectData.send_email_from.name + emailFrom,
        to: recipients,
        subject: msgSubject,
        text: msgBody
      };

      const info = await transporter.sendMail(mailOptions);

      if (info) {
        return resolve({ status: 1 });
      }
    } catch (error) {
      return reject({
        errorCode: 'INVALID_DETAILS_FOR_SMTP',
        errorDetails: error.toString()
      });
    }
  });
};
