import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // api/users/me
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editCurrentUser(
    @GetUser('id') userId: number,
    @Body() editUserDto: EditUserDto,
  ) {
    return this.userService.editCurrentUser(userId, editUserDto);
  }
}
