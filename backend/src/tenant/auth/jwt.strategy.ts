import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { tenantLocalStorage } from '../../common/tenancy/tenant.middleware';
import { isValidUUID } from '../../common/utils/uuid.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // Le JWT vérifié est la SEULE source de vérité du tenantId
    if (payload.tenantId && isValidUUID(payload.tenantId)) {
      tenantLocalStorage.enterWith(payload.tenantId);
    }

    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role, 
      tenantId: payload.tenantId 
    };
  }
}
