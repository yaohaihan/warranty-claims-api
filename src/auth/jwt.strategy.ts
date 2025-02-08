import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret_key',  // 使用与 JWT 模块中相同的密钥
    });
  }

  async validate(payload: any) {
    const user = await this.userService.getUserById(payload.userId);
    if (!user) {
      throw new Error('Invalid token');
    }
    return user;  // 返回用户信息，会存储在 `req.user` 中
  }
}