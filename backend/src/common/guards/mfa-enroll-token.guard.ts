import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class MfaEnrollTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Le token peut être dans le body (enroll_token) ou dans les headers Bearer
    const token = request.body?.enroll_token || 
      (request.headers.authorization?.startsWith('Bearer ') ? request.headers.authorization.split(' ')[1] : null);

    if (!token) {
      throw new UnauthorizedException('Token d\'enrôlement MFA (enroll_token) manquant.');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // VÉRIFICATION STRICTE DU SCOPE : doit être exactement "platform:enroll"
      if (payload.scope !== 'platform:enroll') {
        throw new UnauthorizedException('Portée de jeton (scope) non autorisée. Seul "platform:enroll" est accepté.');
      }

      request['user'] = {
        id: payload.sub,
        email: payload.email,
        scope: payload.scope,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Token d\'enrôlement MFA invalide ou expiré.');
    }
  }
}
