import { NextFunction, Request, Response, Router } from 'express';
import getCon from './getCon';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import randomstring from 'randomstring';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { n, e, p } = req.body;
    if (typeof n !== 'string' && typeof e !== 'string' && typeof p !== 'string')
      return res.status(422).json({ m: 'Dados inválidos.' });
    const con = getCon();
    const old = await con.user.findFirst({ where: { email: e } });
    if (old)
      return res.status(400).json({ message: 'Endereço de e-mail já cadastrado.' });
    const h = bcrypt.hashSync(p, 10);
    const u = await con.user.create({
      data: {
        name: n,
        email: e,
        password: h,
      },
    });
    const { EHOST, EHOSTPORT, EUSER, EPASS } = process.env;
    const t = nodemailer.createTransport({
      host: EHOST,
      port: EHOSTPORT,
      secure: false,
      auth: {
        user: EUSER,
        pass: EPASS,
      },
    } as any);
    const mf1 = await t.sendMail({
      from: 'hermerson@allugator.com',
      to: u.email,
      subject: 'Welcome',
      text: `Welcome ${u.name}.`,
      html: `<p> Welcome ${u.name} </p>`,
    });
    const cod = randomstring.generate({ length: 5 });
    const mf2 = await t.sendMail({
      from: 'hermerson@allugator.com',
      to: u.email,
      subject: 'Confirm Registration',
      text: `Hello ${u.name}! This is your code ${cod}.`,
      html: `<p> Hello ${u.name}! This is your code ${cod}. </p>`,
    });
    return res.status(201).json({ user: u });
  } catch (e: any) {
    console.error(e.stack);
    return next(e);
  }
});


export default router;


