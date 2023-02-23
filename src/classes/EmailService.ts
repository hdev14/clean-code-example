import nodemailer from 'nodemailer';

export type EmailParams = {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export default class EmailService {
  private readonly transport: any;

  constructor() {
    const {
      EMAIL_HOST,
      EMAIL_HOST_PORT,
      EMAIL_USER,
      EMAIL_PASSWORD,
    } = process.env;

    // composition
    this.transport = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_HOST_PORT,
      secure: false,
      auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD, },
    } as any);
  }

  public async send(params: EmailParams) {
    const messageResult = await this.transport.sendMail({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    console.log(messageResult);
  }
}
