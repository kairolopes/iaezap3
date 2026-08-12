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
      console.log('📝 register() called with email:', email);
      const { data, error } = await this.supabase.signup(email, password);
      console.log('🔐 Supabase signup response:', { hasData: !!data, hasError: !!error, errorMsg: error?.message });
      if (error) {
        console.error('❌ Supabase signup error:', error);
        throw new UnauthorizedException(error.message || 'Signup failed');
      }
      if (!data.user) {
        console.error('❌ No user in signup response');
        throw new UnauthorizedException('No user created');
      }
      console.log('✅ User created:', data.user.id, data.user.email);
      return {
        id: data.user.id,
        email: data.user.email,
        name,
        message: 'Verifique seu email para confirmar o registro',
      };
    } catch (error: any) {
      console.error('💥 Register exception:', error.message, error);
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
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
