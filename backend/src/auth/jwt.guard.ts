import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    console.log('🚨 JwtAuthGuard.canActivate invoked');
    console.log('📋 Authorization header:', authHeader ? 'PRESENT' : 'MISSING');
    if (!authHeader) {
      console.log('⚠️ No auth header - dumping ALL headers:');
      console.log(JSON.stringify(request.headers, null, 2));
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔐 JwtAuthGuard.handleRequest called');
    console.log('   err:', err ? JSON.stringify(err, null, 2) : 'null');
    console.log('   user:', user ? JSON.stringify(user, null, 2) : 'null');
    console.log('   info:', info);

    if (err || !user) {
      console.log('❌ JWT validation failed');
      if (err) {
        console.log('❌ Error details:', err.name, '-', err.message);
      }
      throw err || new UnauthorizedException('JWT validation failed');
    }

    console.log('✅ JWT validation success');
    return user;
  }
}
