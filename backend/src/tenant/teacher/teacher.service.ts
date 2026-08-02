import { Injectable } from '@nestjs/common';
import { PrismaService, TenantTransactionClient } from '../../prisma.service';
import {
  TenantCrudService,
  TenantModelDelegate,
} from '../../common/tenancy/tenant-crud.service';

type TeacherRecord = Awaited<ReturnType<PrismaService['teacher']['findFirstOrThrow']>>;

@Injectable()
export class TeacherService extends TenantCrudService<TeacherRecord> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate(tx: TenantTransactionClient): TenantModelDelegate<TeacherRecord> {
    return tx.teacher as unknown as TenantModelDelegate<TeacherRecord>;
  }

  protected get findManyArgs() {
    return { orderBy: { lastName: 'asc' } };
  }

  protected get notFoundMessage() {
    return 'Enseignant non trouvé';
  }
}
