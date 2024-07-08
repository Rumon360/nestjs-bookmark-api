import { Prisma } from '@prisma/client';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto implements Prisma.UserUpdateInput {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
