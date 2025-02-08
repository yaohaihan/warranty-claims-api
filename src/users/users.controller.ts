import { Controller, Get, Post, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  // 注册用户接口
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  // 获取所有用户接口（需要权限）
//   @UseGuards(JwtAuthGuard)
//   @Get()
//   async getAllUsers(): Promise<User[]> {
//     return this.userService.getAllUsers();
//   }

  //获取自个信息
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getOwnAccount(@Request() req): Promise<User> {
    return this.userService.getUserById(req.user._id);
  }

  
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }): Promise<{ access_token: string }> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 返回 JWT 令牌
    return this.authService.login(user);
  }
}
