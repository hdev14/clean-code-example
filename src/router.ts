import { NextFunction, Request, Response, Router } from 'express';
import getDBConnection from './getDBConnection';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import randomstring from 'randomstring';
import nodemailerTransport from './nodemailerTransport';

const router = Router();
const connection = getDBConnection();

const EMAIL_REGEX = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i;

enum HttpStatusCodes {
  ENTITY_UNPROCCESS = 422,
  BAD_REQUEST = 400,
  CREATED = 201,
}

type UserData = {
  name: string;
  email: string;
  password: string;
}

function validateUserData(data: UserData) {
  if (typeof data.name !== 'string'
    && typeof data.email !== 'string'
    && typeof data.password !== 'string') {
    return 'invalid data';
  }

  if (EMAIL_REGEX.test(data.email)) {
    return 'Invalid e-mail address.';
  }

  if (data.password.length < 6) {
    return 'Password must have more than 6 caracters';
  }
}

async function userExist(email: string) {
  const isUserExist = await connection.user.findFirst({
    where: { email: email }
  });

  return isUserExist;
}


async function sendWelcomeEmail(email: string, name: string) {
  const welcomeMessageResult = await nodemailerTransport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome',
    text: `Welcome ${name}.`,
    html: `<p> Welcome ${name} </p>`,
  });

  console.log(welcomeMessageResult);
}

async function sendConfirmRegistrationEmail(email: string, name: string) {
  const registrationCode = randomstring.generate({ length: 5 });

  const registrationMessageResult = await nodemailerTransport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Confirm your registration',
    text: `Hello ${name}! This is your code ${registrationCode}.`,
    html: `<p> Hello ${name}! This is your code ${registrationCode}. </p>`,
  });

  console.log(registrationMessageResult);
}

/* Exemplo com class
type EmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
}

class EmailService {
/   private readonly transport: any;

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
*/

router.post('/users', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, email, password } = request.body;

    const message = validateUserData({ name, email, password });

    if (message) {
      return response.status(HttpStatusCodes.ENTITY_UNPROCCESS).json({ message });
    }

    if (await userExist(email)) {
      return response.status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: 'e-mail address already registered' });
    }

    const user = await connection.user.create({
      data: {
        name: name,
        email: email,
        password: bcrypt.hashSync(password, 10)
      }
    });
    
    await sendWelcomeEmail(user.email, user.name);

    await sendConfirmRegistrationEmail(user.email, user.name);

    /* Exemplo com class
      const emailService = new EmailService();
      
      await emailService.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: 'Welcome',
        text: `Welcome ${name}.`,
        html: `<p> Welcome ${name} </p>`,
      });

      const registrationCode = randomstring.generate({ length: 5 });

      await emailService.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: 'Confirm your registration',
        html: `<p> Hello ${name}! This is your code ${registrationCode}. </p>`,
      });
     */

    return response.status(HttpStatusCodes.CREATED).json(user);
  } catch (e: any) {
    console.error(e.stack);
    return next(e);
  }
});


export default router;


