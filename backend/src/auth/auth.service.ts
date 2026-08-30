import { 
  ConflictException, 
  Injectable, 
  ForbiddenException, 
  UnauthorizedException } from '@nestjs/common';

import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
  ) {}

  // Asinhrona funkcija - izvrsavanje traje neko vreme
  // (zbog pristupa bazi, slanja HTTP zahteva, citanja fajla...),
  // pritom ne blokira ostatak programa.
  // await - ceka rezultat
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Korisnik sa ovom email adresom već postoji.');
    }

    const passwordHash = await argon2.hash(registerDto.password, {type: argon2.argon2id});

    return this.usersService.create(
      registerDto.firstName.trim(),
      registerDto.lastName.trim(),
      email,
      passwordHash,
    );
  }

  async login(loginDto: LoginDto){
    const email = loginDto.email.trim().toLocaleLowerCase();
    const user = await this.usersService.findByEmail(email);

    // ista poruka i kada korisnik ne postoji i kada je lozinka pogresna.
    // U suprotnom, se moze proveriti koje email adrese postoje u sistemu.
    if (!user) {
    throw new UnauthorizedException('Neispravan email ili lozinka.');
    }

    // poredjenje hash-a iz baze sa unetim, lozinka se ne desifruje
    const passwordIsValid = await argon2.verify(user.passwordHash, loginDto.password);
  
    if (!passwordIsValid) {
    throw new UnauthorizedException('Neispravan email ili lozinka.');
    }

    if (!user.isActive) {
    throw new ForbiddenException('Korisnički nalog je deaktiviran.');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}