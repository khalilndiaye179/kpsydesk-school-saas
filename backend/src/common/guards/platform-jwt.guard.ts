import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class PlatformJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token d\'accès platform manquant ou invalide.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'kpsydesk_jwt_super_secret_key_change_me_in_production',
      });

      // VÉRIFICATION STRICTE DU SCOPE : doit être exactement "platform"
      // Rejette strictement "platform:enroll" et tout scope tenant
      if (payload.scope !== 'platform') {
        throw new UnauthorizedException('Portée de jeton (scope) non autorisée pour cette ressource.');
      }

      request['user'] = {
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
