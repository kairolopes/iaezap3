import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';

const passport = require('passport-jwt');
const ExtractJwt = passport.ExtractJwt;
const Strategy = passport.Strategy;

const customExtractJwt = (request: any) => {
  console.log('🔍 customExtractJwt invoked');
  const authHeader = request.headers['authorization'];
  console.log('📦 Raw Authorization header:', authHeader || 'MISSING');

  if (!authHeader) {
    console.log('❌ No authorization header');
    return null;
  }

  const parts = authHeader.split(' ');
  console.log('🔗 Header parts:', parts.length, 'parts');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('❌ Invalid Bearer format. Expected "Bearer <token>"');
    return null;
  }

  const token = parts[1];
  console.log('✅ Token extracted, length:', token.length);
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private auth: AuthService) {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    console.log('🔐 JwtStrategy initialized with secret length:', secret.length);
    super({
      jwtFromRequest: customExtractJwt,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    console.log('✅ JwtStrategy PassportStrategy configured with customExtractJwt');
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
