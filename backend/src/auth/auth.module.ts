import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';
import { SupabaseModule } from '../supabase/supabase.module';

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
console.log('📝 AuthModule JwtModule.register secret length:', jwtSecret.length);
console.log('📝 AuthModule JWT_SECRET from env:', process.env.JWT_SECRET ? 'YES' : 'NO (using fallback)');

@Module({
  imports: [
    SupabaseModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
