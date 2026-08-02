import { NotFoundException } from '@nestjs/common';
import { PrismaService, TenantTransactionClient } from '../../prisma.service';

type QueryArgs = Record<string, unknown>;

/**
 * Sous-ensemble d'un delegate Prisma utilisé par les ressources tenant.
 */
export interface TenantModelDelegate<TRecord> {
  findMany(args?: QueryArgs): Promise<TRecord[]>;
  create(args: { data: QueryArgs }): Promise<TRecord>;
  findUnique(args: QueryArgs): Promise<TRecord | null>;
}

/**
 * Base des services CRUD tenant : chaque requête est exécutée via
 * `runWithTenantContext` afin que le `SET LOCAL app.tenant_id` (RLS) soit appliqué.
 * Une ressource concrète n'a qu'à exposer son delegate Prisma et, si besoin,
 * surcharger les options de requête.
 */
export abstract class TenantCrudService<TRecord> {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected abstract getDelegate(tx: TenantTransactionClient): TenantModelDelegate<TRecord>;

  /** Options (tri, relations) appliquées aux listes. */
  protected get findManyArgs(): QueryArgs {
    return {};
  }

  /** Options (relations) appliquées à la lecture unitaire. */
  protected get findUniqueArgs(): QueryArgs {
    return {};
  }

  protected get notFoundMessage(): string {
    return 'Ressource non trouvée';
  }

  findAll(): Promise<TRecord[]> {
    return this.prisma.runWithTenantContext((tx) =>
      this.getDelegate(tx).findMany(this.findManyArgs),
    );
  }

  create(data: QueryArgs, tenantId: string): Promise<TRecord> {
    return this.prisma.runWithTenantContext((tx) =>
      this.getDelegate(tx).create({ data: { ...data, tenantId } }),
    );
  }

  async findOne(id: string): Promise<TRecord> {
    const record = await this.prisma.runWithTenantContext((tx) =>
      this.getDelegate(tx).findUnique({ where: { id }, ...this.findUniqueArgs }),
    );

    if (!record) {
      throw new NotFoundException(this.notFoundMessage);
    }

    return record;
  }
}
