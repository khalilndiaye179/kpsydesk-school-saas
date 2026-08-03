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
    const cleanEmail = email.trim().toLowerCase();

    // 1. Tenter la résolution depuis le sous-domaine Host (ex: lycee-abdoulaye-sadji.kpsyschool.com -> lycee-abdoulaye-sadji)
    if (!targetTenantId && host) {
      const cleanHost = host.split(':')[0]; // Retirer le port si présent
      const parts = cleanHost.split('.');
      if (parts.length >= 2 && !['app', 'www', 'localhost', '127', 'school', 'srv1838382'].includes(parts[0])) {
        const sub = parts[0].toLowerCase();
        const tenant = await this.prisma.tenant.findFirst({ 
          where: { subdomain: { equals: sub, mode: 'insensitive' } } 
        });
        if (tenant) {
          targetTenantId = tenant.id;
        }
      }
    }

    // 2. Si pas trouvé par sous-domaine, chercher le TenantUser par email (insensible à la casse)
    if (!targetTenantId) {
      const userByEmail = await this.prisma.tenantUser.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      });
      if (userByEmail) {
        targetTenantId = userByEmail.tenantId;
      }
    }

    // 3. Fallback : Si un seul tenant existe en base de données, l'utiliser par défaut
    if (!targetTenantId) {
      const count = await this.prisma.tenant.count();
      if (count === 1) {
        const onlyTenant = await this.prisma.tenant.findFirst();
        if (onlyTenant) {
          targetTenantId = onlyTenant.id;
        }
      }
    }

    if (!targetTenantId) {
      throw new UnauthorizedException('Établissement introuvable pour ces identifiants');
    }

    // Recherche de l'utilisateur dans l'établissement identifié
    const user = await this.prisma.tenantUser.findFirst({
      where: { 
        email: { equals: cleanEmail, mode: 'insensitive' }, 
        tenantId: targetTenantId 
      },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides pour cet établissement');
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

