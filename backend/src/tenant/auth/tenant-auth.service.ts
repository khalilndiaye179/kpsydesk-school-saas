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

    // Étape 1 : Résolution par sous-domaine extrait du Host HTTP
    if (!targetTenantId && host) {
      const cleanHost = host.split(':')[0];
      const parts = cleanHost.split('.');
      const excluded = ['app', 'www', 'localhost', '127', 'school', 'srv1838382', 'kpsyinformatique', 'kpsyschool'];
      if (parts.length >= 2 && !excluded.includes(parts[0])) {
        const sub = parts[0].toLowerCase();
        const tenant = await this.prisma.tenant.findUnique({ where: { subdomain: sub } });
        if (tenant) {
          targetTenantId = tenant.id;
        }
      }
    }

    // Étape 2 : Résolution par email de l'utilisateur
    if (!targetTenantId) {
      const found = await this.prisma.tenantUser.findFirst({
        where: { email: cleanEmail },
      });
      if (found) {
        targetTenantId = found.tenantId;
      }
    }

    // Étape 2b : Essai avec l'email exact tel que saisi (casse originale)
    if (!targetTenantId) {
      const found = await this.prisma.tenantUser.findFirst({
        where: { email: email.trim() },
      });
      if (found) {
        targetTenantId = found.tenantId;
      }
    }

    // Étape 3 : Fallback mono-tenant (si un seul établissement en base)
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
      throw new UnauthorizedException('Établissement introuvable. Contactez votre administrateur.');
    }

    // Recherche de l'utilisateur (essai lowercase puis casse originale)
    let user = await this.prisma.tenantUser.findFirst({
      where: { email: cleanEmail, tenantId: targetTenantId },
    });
    if (!user) {
      user = await this.prisma.tenantUser.findFirst({
        where: { email: email.trim(), tenantId: targetTenantId },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides pour cet établissement');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
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

