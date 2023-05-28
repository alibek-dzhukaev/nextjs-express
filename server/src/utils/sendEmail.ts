import nodemailer from 'nodemailer'

export async function sendEmail(to: string, html: string) {
  // let testAccount = await nodemailer.createTestAccount()
  // console.log('testAccount: ', testAccount)

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'shs2g2ilgw73r5mk@ethereal.email',
      pass: 'FgGaPDcZt4Sa9vHV8F',
    },
  })

  const info = await transporter.sendMail({
    from: 'Fred Foo 👻 <foo@example.com>',
    to,
    subject: 'Change password',
    text: 'Hello',
    html,
  })

  console.log('Message sent: %s', info.messageId)
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
