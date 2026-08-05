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

  async login(usernameInput: string, pass: string) {
    if (!usernameInput || !usernameInput.trim()) {
      throw new UnauthorizedException("Veuillez fournir votre identifiant (ex: LYC-EDA-0001).");
    }

    const cleanUsername = usernameInput.trim().toUpperCase();

    // Recherche directe et unique en 1 seule requête SQL par username
    const user = await this.prisma.tenantUser.findFirst({
      where: { username: cleanUsername },
    });

    if (!user) {
      throw new UnauthorizedException("Identifiant invalide ou introuvable.");
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException("Mot de passe incorrect.");
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
      }
    };
  }

}

