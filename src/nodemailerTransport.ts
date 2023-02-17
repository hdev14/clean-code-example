import nodemailer from 'nodemailer';

const {
  EMAIL_HOST,
  EMAIL_HOST_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
} = process.env;

const nodemailerTransport = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_HOST_PORT,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD, },
} as any);


export default nodemailerTransport;