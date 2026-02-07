import nodemailer from 'nodemailer';

export class EmailService {
  static async sendEmail(
    sender: { host: string; port: number; user: string; pass: string; email: string },
    recipient: string,
    subject: string,
    body: string
  ) {
    const transporter = nodemailer.createTransport({
      host: sender.host,
      port: sender.port,
      auth: {
        user: sender.user,
        pass: sender.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${sender.email}" <${sender.user}>`,
      to: recipient,
      subject: subject,
      html: body,
    });

    return info;
  }

  static async createTestAccount() {
    return await nodemailer.createTestAccount();
  }
}
