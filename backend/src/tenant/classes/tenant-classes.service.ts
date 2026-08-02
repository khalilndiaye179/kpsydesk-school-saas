import { Injectable } from '@nestjs/common';
import { PrismaService, TenantTransactionClient } from '../../prisma.service';
import {
  TenantCrudService,
  TenantModelDelegate,
} from '../../common/tenancy/tenant-crud.service';

type ClassRecord = Awaited<ReturnType<PrismaService['class']['findFirstOrThrow']>>;

@Injectable()
export class TenantClassesService extends TenantCrudService<ClassRecord> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate(tx: TenantTransactionClient): TenantModelDelegate<ClassRecord> {
    return tx.class as unknown as TenantModelDelegate<ClassRecord>;
  }

  protected get findManyArgs() {
    return { include: { _count: { select: { students: true } } } };
  }

  protected get notFoundMessage() {
    return 'Classe non trouvée';
  }
}
