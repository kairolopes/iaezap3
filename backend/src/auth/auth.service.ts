import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private supabase: SupabaseService,
  ) {}

  async register(email: string, password: string, name: string) {
    try {
      const { data, error } = await this.supabase.signup(email, password);
      if (error || !data.user) {
        throw new UnauthorizedException(error?.message || 'Registration failed');
      }
      return { id: data.user.id, email: data.user.email, name };
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Registration failed');
    }
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.login(email, password);
      if (error || !data.user || !data.session) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const token = this.jwt.sign({
        sub: data.user.id,
        email: data.user.email,
        role: 'USER',
      });

      return {
        token,
        access_token: token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: 'USER',
        },
      };
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }

  async validateToken(payload: any) {
    const user = await this.supabase.getUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
