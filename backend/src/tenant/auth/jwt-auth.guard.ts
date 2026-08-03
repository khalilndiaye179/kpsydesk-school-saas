import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { tenantLocalStorage } from '../../common/tenancy/tenant.middleware';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isValid = (await super.canActivate(context)) as boolean;
    if (isValid) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (user && user.tenantId) {
        // Enregistre le tenantId extrait de façon sécurisée du JWT dans le stockage asynchrone du thread
        tenantLocalStorage.enterWith(user.tenantId);
      }
    }
    return isValid;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Vous devez être connecté pour accéder à cette ressource');
    }
    return user;
  }
}

