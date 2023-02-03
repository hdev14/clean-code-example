import { NextFunction, Request, Response, Router } from 'express';
import getCon from './getCon';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import randomstring from 'randomstring';

const r = Router();

r.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { n, e, p } = req.body;
    if (typeof n !== 'string' && typeof e !== 'string' && typeof p !== 'string')
      return res.status(422).json({ m: 'invalid data' });
    const con = getCon();
    const old = await con.user.findFirst({ where: { email: e } });
    if (old)
      return res.status(400).json({ message: 'e-mail address already registered' });
    const h = bcrypt.hashSync(p, 10);
    const u = await con.user.create({ data: { name: n, email: e, password: h } });
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
    return res.status(201).json({ user: u });
  } catch (e: any) {
    console.error(e.stack);
    return next(e);
  }
});


export default r;


