import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {

  @IsEmail()
  @MaxLength(255)
  email!: string;       // ! kaže TypeScript-u da će vrednost biti postavljena prilikom obrade DTO-a.

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}