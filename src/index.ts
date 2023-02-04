import dotenv from 'dotenv';
import express from 'express';
import router from './router';
import getCon from './getCon';

dotenv.config();

(async () => {
  let con = getCon();

  try {
    const app = express();

    app.use(express.json());

    app.use(router);

    app.listen(3000, () => {
      console.log('Server is running.');
    });
  } catch (e) {
    await con?.$disconnect();
  }
});


