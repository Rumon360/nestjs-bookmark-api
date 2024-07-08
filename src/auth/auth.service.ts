import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async login(loginDto: LoginDto) {
    try {
      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      // Check if user exists
      if (!user) {
        throw new ForbiddenException('Invalid Credentials');
      }

      // Compare password
      const passwordMatched = await argon.verify(
        user.hashedPassword,
        loginDto.password,
      );

      // If password doesn't match, throw an error
      if (!passwordMatched) {
        throw new ForbiddenException('Invalid Credentials');
      }

      const jwtToken = await this.signToken(user.id, user.email);

      return { access_token: jwtToken };
    } catch (error) {
      throw new ForbiddenException('Invalid credentials');
    }
  }
  async signup(signUpDto: SignUpDto) {
    try {
      const hashedPassword = await argon.hash(signUpDto.hashedPassword);
      const user = await this.prisma.user.create({
        data: {
          name: signUpDto.name,
          email: signUpDto.email,
          hashedPassword: hashedPassword,
        },
        select: { id: true, email: true, name: true, bookmarks: true },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }
      throw new Error('Failed to create user');
    }
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');
    const expiresIn = this.config.get('JWT_EXPIRATION_TIME');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: expiresIn,
      secret: secret,
    });

    return token;
  }
}
