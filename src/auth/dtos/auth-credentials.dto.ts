import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(3)
  @MaxLength(25)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(35)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must include at-least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
  })
  password: string;
}
