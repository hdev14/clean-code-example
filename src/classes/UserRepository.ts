import { PrismaClient } from "@prisma/client";
import getDBConnection from "../getDBConnection";

/* 
  A responsabilidade do Repository é fazer a comunicação necessária com o banco de dados, 
  separando assim a lógica das outras classes.
*/
export default class UserRepository {
  private readonly connection: PrismaClient;
  
  constructor() {
    // Composition
    this.connection = getDBConnection();
  }

  public async findByEmail(email: string) {
    const user = await this.connection.user.findFirst({
      where: { email: email }
    });
  
    return user;
  }

  public async save(name: string, email: string, password: string) {
    const user = await this.connection.user.create({
      data: { name, email, password }
    });

    return user;
  }
}