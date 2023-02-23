import bcrypt from 'bcrypt';
import randomstring from 'randomstring';
import UserRepository from "./UserRepository";
import EmailService from "./EmailService";
import ValidationError from './ValidationError';
import SameEmailError from './SameEmailError';

export type UserData = {
  name: string;
  email: string;
  password: string;
}

const EMAIL_REGEX = new RegExp("^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$", "i");

/* 
  A responsabilidade do Service é fazer toda a lógica de integração entre as outras camadas.
  Ou seja, chamar o userRepository e o emailService quando necessário.
*/
export default class UserService {
  constructor(
    // Aggregation
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) { }

  public async create(data: UserData) {
    this.validateUserData(data);

    const isUserExist = await this.userRepository.findByEmail(data.email);

    if (isUserExist) {
      throw new SameEmailError();
    }

    const user = await this.userRepository.save(
      data.name,
      data.email,
      bcrypt.hashSync(data.password, 10)
    );

    await this.emailService.send({
      from: process.env.EMAIL_FROM!,
      to: data.email,
      subject: 'Welcome',
      html: `<p> Welcome ${data.name} </p>`,
    });

    const registrationCode = randomstring.generate({ length: 5 });

    await this.emailService.send({
      from: process.env.EMAIL_FROM!,
      to: data.email,
      subject: 'Confirm your registration',
      html: `<p> Hello ${data.name}! This is your code ${registrationCode}. </p>`,
    });

    return user;
  }

  // Método privado para abstrair a lógica e dá um nome mais adequado.
  private validateUserData(data: UserData) {
    // Preciso lançar um erro, pq o Service não é responsavel por retornar status code e JSON.
    console.log(data);
    if (typeof data.name !== 'string'
      && typeof data.email !== 'string'
      && typeof data.password !== 'string') {
      throw new ValidationError('Invalid data');
    }

    if (!EMAIL_REGEX.test(data.email)) {
      throw new ValidationError('Invalid e-mail address.');
    }

    if (data.password.length < 6) {
      throw new ValidationError('Password must have more than 6 caracters');
    }
  }
}