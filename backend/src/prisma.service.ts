import { Injectable, OnModuleInit, OnModuleDestroy, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantLocalStorage } from './common/tenancy/tenant.middleware';
import { isValidUUID } from './common/utils/uuid.util';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Wrapper pour exécuter toutes les requêtes métier sous une transaction PostgreSQL
   * appliquant le tenant_id avec SET LOCAL.
   */
  async runWithTenantContext<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    const tenantId = tenantLocalStorage.getStore();

    if (!tenantId) {
      // Pas de tenant context (ex: requête globale admin ou tâche asynchrone)
      return callback(this);
    }

    // Protection stricte contre l'injection SQL : validation du format UUID v4
    if (!isValidUUID(tenantId)) {
      throw new BadRequestException('Security Violation: Invalid Tenant ID format.');
    }

    // Exécution dans une transaction SQL pour appliquer le SET LOCAL du tenant_id
    return this.$transaction(async (tx) => {
      // SET LOCAL réinitialise automatiquement app.tenant_id après la transaction
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}';`);
      return callback(tx);
    });
  }
}
