import { BadRequestException, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantLocalStorage } from './common/tenancy/tenant.middleware';
import { isValidTenantId } from './common/tenancy/tenant-id';

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

    if (!isValidTenantId(tenantId)) {
      throw new BadRequestException('Identifiant de tenant invalide.');
    }

    // Exécution dans une transaction SQL pour appliquer le tenant_id local à la transaction.
    return this.$transaction(async (tx) => {
      // set_config(..., is_local = true) équivaut à SET LOCAL et prend une valeur
      // paramétrée : aucune interpolation de chaîne dans le SQL.
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      return callback(tx);
    });
  }
}
