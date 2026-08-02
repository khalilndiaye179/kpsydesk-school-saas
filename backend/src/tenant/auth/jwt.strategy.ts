import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getJwtSecret } from '../../common/config/jwt.config';
import { isValidTenantId } from '../../common/tenancy/tenant-id';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    // Seuls les jetons tenant (sans scope platform) donnent accès aux ressources tenant
    if (payload.scope || !isValidTenantId(payload.tenantId)) {
      throw new UnauthorizedException('Jeton sans contexte tenant valide');
    }

    // Ce payload est ce qu'on a mis dans signAsync({ sub, email, role, tenantId })
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role, 
      tenantId: payload.tenantId 
    };
  }
}
