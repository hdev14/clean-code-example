import { NextFunction, Request, Response, Router } from 'express';
import getCon from './getCon';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import randomstring from 'randomstring';

const r = Router();

r.post('/', async (req: Request, res: Response, n: NextFunction) => {
  try {
    if (typeof req.body.name !== 'string' && typeof req.body.email !== 'string' && typeof req.body.password !== 'string')
      return res.status(422).json({ message: 'invalid data' });
    if (/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i.test(req.body.email)) return res.status(400).json({ message: 'Invalid e-mail address.' });
    if (req.body.password.length < 6) return res.status(400).json({ message: 'Password must have more than 6 caracters' });
    const con = getCon();
    const old = await con.user.findFirst({ where: { email: req.body.email } });
    if (old)
      return res.status(400).json({ message: 'e-mail address already registered' });
    const h = bcrypt.hashSync(req.body.password, 10);
    const u = await con.user.create({ data: { name: req.body.name, email: req.body.email, password: h } });
    const { EHOST, EHOSTPORT, EUSER, EPASS, EFROM } = process.env;
    const t = nodemailer.createTransport({
      host: EHOST, port: EHOSTPORT, secure: false,
      auth: { user: EUSER, pass: EPASS, },
    } as any);
    const mf1 = await t.sendMail({
      from: EFROM, to: u.email, subject: 'Welcome',
      text: `Welcome ${u.name}.`, html: `<p> Welcome ${u.name} </p>`,
    });
    const cod = randomstring.generate({ length: 5 });
    console.log(mf1);
    const mf2 = await t.sendMail({
      from: EFROM, to: u.email, subject: 'Confirm your registration',
      text: `Hello ${u.name}! This is your code ${cod}.`, html: `<p> Hello ${u.name}! This is your code ${cod}. </p>`,
    });
    console.log(mf2);
    return res.status(201).json(u);
  } catch (e: any) {
    console.error(e.stack);
    return n(e);
  }
});


export default r;


