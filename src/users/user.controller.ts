import { Controller, Get, Post, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('User')  
@ApiBearerAuth() 
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  // 注册用户接口
  @Post('register')
  @ApiOperation({ summary: 'Register' })
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
  @ApiOperation({ summary: 'View my own account info' })
  async getOwnAccount(@Request() req): Promise<User> {
    return this.userService.getUserById(req.user._id);
  }


  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT' })
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('User Not Found');
    }

    return this.authService.login(user);
  }
}
