import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';

const passport = require('passport-jwt');
const ExtractJwt = passport.ExtractJwt;
const Strategy = passport.Strategy;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private auth: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: any) {
    console.log('🔐 JWT validate called with payload:', payload);
    try {
      const result = await this.auth.validateToken(payload);
      console.log('✅ JWT validate success, returning:', result);
      return result;
    } catch (e) {
      console.error('❌ JWT validate error:', e.message);
      throw e;
    }
  }
}
