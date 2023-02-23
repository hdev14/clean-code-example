import { Router } from 'express';
import UserController from './classes/UserController';

const router = Router();

const userController = new UserController();

// Como no React com classes é necessário fazer o bind se não o método perde o contexto da class. 
router.post('/users', userController.create.bind(userController)); 

export default router;


