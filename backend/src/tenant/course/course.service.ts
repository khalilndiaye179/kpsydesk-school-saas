import { Injectable } from '@nestjs/common';
import { PrismaService, TenantTransactionClient } from '../../prisma.service';
import {
  TenantCrudService,
  TenantModelDelegate,
} from '../../common/tenancy/tenant-crud.service';

type CourseRecord = Awaited<ReturnType<PrismaService['course']['findFirstOrThrow']>>;

@Injectable()
export class CourseService extends TenantCrudService<CourseRecord> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate(tx: TenantTransactionClient): TenantModelDelegate<CourseRecord> {
    return tx.course as unknown as TenantModelDelegate<CourseRecord>;
  }

  protected get findManyArgs() {
    return { orderBy: { name: 'asc' } };
  }

  protected get notFoundMessage() {
    return 'Matière non trouvée';
  }
}
