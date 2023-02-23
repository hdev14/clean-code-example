import { NextFunction, Request, Response } from "express";
import EmailService from "./EmailService";
import SameEmailError from "./SameEmailError";
import UserRepository from "./UserRepository";
import UserService from "./UserService";
import ValidationError from "./ValidationError";

enum HttpStatusCodes {
  ENTITY_UNPROCCESS = 422,
  BAD_REQUEST = 400,
  CREATED = 201,
}

/* 
  O controller é responsável por encaminhar os dados da 
  requisição e retornar na resposta o status code correto e o conteúdo (body).
*/
export default class UserController {
  private readonly userService: UserService;

  constructor() {
    // Composition
    this.userService = new UserService(new UserRepository(), new EmailService());
  }

  public async create(request: Request, response: Response) {
    try {
      const { name, email, password } = request.body;

      const user = await this.userService.create({ name, email, password });

      return response.status(HttpStatusCodes.CREATED).json(user);
    } catch (e: any) {
      /* 
        Dentro desse catch é validado todos os problemas que deram na execução do Service.
        Se caso ocorre algum erro que não esperamos, então o padrão é retornar status code 500.
      */

      if (e instanceof ValidationError) {
        return response.status(HttpStatusCodes.ENTITY_UNPROCCESS).json({ message: e.message });
      }

      if (e instanceof SameEmailError) {
        return response.status(HttpStatusCodes.BAD_REQUEST).json({ message: e.message });
      } 

      console.log(e.stack);

      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }
}