import { Injectable } from '@nestjs/common';
import { PrismaService, TenantTransactionClient } from '../../prisma.service';
import {
  TenantCrudService,
  TenantModelDelegate,
} from '../../common/tenancy/tenant-crud.service';

type StudentRecord = Awaited<ReturnType<PrismaService['student']['findFirstOrThrow']>>;

@Injectable()
export class StudentService extends TenantCrudService<StudentRecord> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate(tx: TenantTransactionClient): TenantModelDelegate<StudentRecord> {
    return tx.student as unknown as TenantModelDelegate<StudentRecord>;
  }

  protected get findManyArgs() {
    return { include: { class: true }, orderBy: { lastName: 'asc' } };
  }

  protected get findUniqueArgs() {
    return { include: { class: true } };
  }

  protected get notFoundMessage() {
    return 'Élève non trouvé';
  }
}
