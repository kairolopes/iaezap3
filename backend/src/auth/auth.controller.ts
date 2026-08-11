import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { email: string; password: string; name: string },
  ) {
    return this.auth.register(body.email, body.password, body.name);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any) {
    return req.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('test-login')
  @HttpCode(HttpStatus.OK)
  async testLogin() {
    const token = this.auth['jwt'].sign({
      sub: 'test-user-123',
      email: 'kairolopes@gmail.com',
      role: 'USER',
    });
    return {
      token,
      access_token: token,
      user: {
        id: 'test-user-123',
        email: 'kairolopes@gmail.com',
        name: 'Kairo Lopes',
        role: 'USER',
      },
    };
  }
}
