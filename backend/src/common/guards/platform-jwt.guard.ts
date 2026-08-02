import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { extractBearerToken } from '../auth/bearer-token.util';
import { JWT_SECRET } from '../config/jwt.config';
import { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class PlatformJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(
      request,
      "Token d'accès platform manquant ou invalide.",
    );

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: JWT_SECRET });

      // VÉRIFICATION STRICTE DU SCOPE : doit être exactement "platform"
      // Rejette strictement "platform:enroll" et tout scope tenant
      if (payload.scope !== 'platform') {
        throw new UnauthorizedException('Portée de jeton (scope) non autorisée pour cette ressource.');
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        scope: payload.scope,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Jeton d\'accès invalide ou expiré.');
    }
  }
}
