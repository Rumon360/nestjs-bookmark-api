import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editCurrentUser(userId: number, editUserDto: EditUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...editUserDto,
        },
        select: { id: true, name: true, email: true, bookmarks: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }
      return user;
    } catch (error) {
      throw new Error(
        `Unable to edit user with ID ${userId}: ${error.message}`,
      );
    }
  }
}
