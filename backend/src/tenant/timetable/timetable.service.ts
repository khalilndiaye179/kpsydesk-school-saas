import { Injectable } from '@nestjs/common';
import { PrismaService, TenantTransactionClient } from '../../prisma.service';
import {
  TenantCrudService,
  TenantModelDelegate,
} from '../../common/tenancy/tenant-crud.service';

type TimetableRecord = Awaited<ReturnType<PrismaService['timetable']['findFirstOrThrow']>>;

@Injectable()
export class TimetableService extends TenantCrudService<TimetableRecord> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate(tx: TenantTransactionClient): TenantModelDelegate<TimetableRecord> {
    return tx.timetable as unknown as TenantModelDelegate<TimetableRecord>;
  }

  protected get findManyArgs() {
    return {
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: { class: true, course: true, teacher: true },
    };
  }

  protected get notFoundMessage() {
    return 'Créneau non trouvé';
  }
}
