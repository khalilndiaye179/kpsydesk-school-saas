import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string, tenantId?: string, host?: string) {
    let targetTenantId = tenantId;

    // 1. Si pas de tenantId transmis, tenter la résolution depuis le sous-domaine Host (ex: lycee-abdoulaye-sadji.kpsyschool.com)
    if (!targetTenantId && host) {
      const cleanHost = host.split(':')[0]; // Retirer le port si présent
      const parts = cleanHost.split('.');
      if (parts.length >= 3 && parts[0] !== 'app' && parts[0] !== 'www' && parts[0] !== 'localhost') {
        const sub = parts[0];
        const tenant = await this.prisma.tenant.findUnique({ where: { subdomain: sub } });
        if (tenant) {
          targetTenantId = tenant.id;
        }
      }
    }

    // 2. Si toujours pas de tenantId, chercher le TenantUser par email
    if (!targetTenantId) {
      const userByEmail = await this.prisma.tenantUser.findFirst({
        where: { email },
      });
      if (userByEmail) {
        targetTenantId = userByEmail.tenantId;
      }
    }

    if (!targetTenantId) {
      throw new UnauthorizedException('Établissement introuvable pour ces identifiants');
    }

    // Les requêtes ici sont exécutées sous le scoping tenant_id via PrismaService
    const user = await this.prisma.tenantUser.findFirst({
      where: { email, tenantId: targetTenantId },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role, 
      tenantId: user.tenantId 
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    };
  }
}

