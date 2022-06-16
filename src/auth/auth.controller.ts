import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(`/signup`)
  signup(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.createUser(authCredentialsDto);
  }

  @Post(`/signin`)
  signin(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signin(authCredentialsDto);
  }
}
