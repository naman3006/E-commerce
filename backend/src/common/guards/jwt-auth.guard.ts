import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserPayload } from '../interfaces/user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser extends UserPayload = UserPayload>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err) {
      this.logger.warn(`JWT authentication error: ${err.message}`);
      throw err;
    }
    if (!user) {
      this.logger.warn('JWT authentication failed: No user found');
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
