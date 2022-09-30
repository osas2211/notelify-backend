const nodemail = require("nodemailer")

module.exports.sendEmail = async (to_mail, subject, body) => {
  try {
    const transporter = nodemail.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    })
    await transporter.sendMail({
      from: `"Notelify App"  ${process.env.MAIL}`,
      to: to_mail,
      subject: subject,
      html: body,
      priority: "high",
    })
  } catch (error) {
    console.log(error.message)
  }
}
