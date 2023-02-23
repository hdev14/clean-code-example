import dotenv from 'dotenv';
import express from 'express';
dotenv.config();
import router from './router';
import getDBConnection from './getDBConnection';

(async () => {
  let connection = getDBConnection();
  try {
    const app = express();
    app.use(express.json());
    app.use(router);
    app.listen(3000, () => {
      console.log('Server is running.');
    });
  } catch (e) {
    await connection?.$disconnect();
  }
})();


