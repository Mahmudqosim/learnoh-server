const nodemailer = require("nodemailer")

const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      // type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        // clientId: process.env.OAUTH_CLIENTID,
        // clientSecret: process.env.OAUTH_CLIENT_SECRET,
        // refreshToken: process.env.OAUTH_REFRESH_TOKEN
    },
  })


  const msg = {
      from: `${process.env.MAIL_USERNAME}>`,
      to: email,
      subject,
      text: message
  }

  await transporter.sendMail(msg)
}

module.exports = sendEmail
