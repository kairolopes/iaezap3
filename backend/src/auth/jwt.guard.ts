import { Injectable, ExecutionContext } from '@nestjs/common';
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
}
