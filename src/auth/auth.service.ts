import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    // Hash password
    // // Generate salt
    const salt = await bcrypt.genSalt();
    const hashedAndSaltedPwd = await bcrypt.hash(password, salt);

    const user = await this.userRepository.create({
      username,
      password: hashedAndSaltedPwd,
    });

    try {
      this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(`Username "${username}" already in use`);
      }
      throw new InternalServerErrorException();
    }
  }

  async signin(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;

    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const jwtPayload: JwtPayload = { username };
      const accessToken: string = await this.jwtService.sign(jwtPayload);

      return { accessToken };
    } else {
      throw new UnauthorizedException(`Invalid username or password.`);
    }
  }
}
