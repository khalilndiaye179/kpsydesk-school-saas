import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SystemConfigService } from './system-config.service';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private systemConfigService: SystemConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url: string = request.url || '';

    // Ne pas bloquer la vérification de statut de la maintenance, la connexion SuperAdmin ou les endpoints de login
    if (
      url.includes('/platform/system-config') ||
      url.includes('/auth/super-admin/login') ||
      url.includes('/platform/tenants') ||
      url.includes('/admin/')
    ) {
      return true;
    }

    // Vérification du rôle utilisateur présent dans le token JWT s'il est déjà décodé
    const user = request.user;
    if (user && (user.role === 'SUPER_ADMIN' || user.isSuperAdmin)) {
      return true;
    }

    const config = await this.systemConfigService.getConfig();

    if (config.maintenanceMode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Service Unavailable',
          message: config.maintenanceMessage,
          isMaintenance: true,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return true;
  }
}
