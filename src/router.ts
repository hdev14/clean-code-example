import { NextFunction, Request, Response, Router } from 'express';
import getDBConnection from './getDBConnection';
import bcrypt from 'bcrypt';
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

    return response.status(HttpStatusCodes.CREATED).json(user);
  } catch (e: any) {
    console.error(e.stack);
    return next(e);
  }
});


export default router;


