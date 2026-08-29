import { ConflictException, Injectable } from '@nestjs/common';

import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();

    const existingUser =
      await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        'Korisnik sa ovom email adresom već postoji.',
      );
    }

    const passwordHash = await argon2.hash(
      registerDto.password,
      {
        type: argon2.argon2id,
      },
    );

    return this.usersService.create(
      registerDto.firstName.trim(),
      registerDto.lastName.trim(),
      email,
      passwordHash,
    );
  }
}