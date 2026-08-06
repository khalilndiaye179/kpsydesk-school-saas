import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TrialPrintGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.tenantId || user?.tenantId;

    if (!tenantId) {
      return true; // Si pas de contexte tenant (ex: SuperAdmin global), ignorer la vérification
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { status: true },
    });

    if (tenant && tenant.status === 'TRIAL') {
      throw new ForbiddenException(
        'L\'impression et l\'exportation de documents officiels sont bloquées pendant la période d\'essai. Veuillez souscrire et faire valider votre abonnement pour débloquer les impressions.',
      );
    }

    return true;
  }
}
