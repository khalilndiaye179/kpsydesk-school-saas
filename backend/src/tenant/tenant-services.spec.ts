import { NotFoundException } from '@nestjs/common';
import { StudentService } from './student/student.service';
import { ClassService } from './class/class.service';
import { CourseService } from './course/course.service';
import { TeacherService } from './teacher/teacher.service';
import { TimetableService } from './timetable/timetable.service';
import { TenantClassesService } from './classes/tenant-classes.service';

const buildTx = () => ({
  student: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ id: 'st1' }), findUnique: jest.fn() },
  class: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ id: 'c1' }) },
  course: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ id: 'co1' }) },
  teacher: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ id: 't1' }) },
  timetable: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ id: 'tt1' }) },
});

describe('tenant-scoped services', () => {
  let tx: ReturnType<typeof buildTx>;
  let prisma: { runWithTenantContext: jest.Mock };

  beforeEach(() => {
    tx = buildTx();
    prisma = { runWithTenantContext: jest.fn((cb: any) => cb(tx)) };
  });

  describe('StudentService', () => {
    it('lists students with their class, sorted by last name', async () => {
      await new StudentService(prisma as any).findAll();
      expect(prisma.runWithTenantContext).toHaveBeenCalled();
      expect(tx.student.findMany).toHaveBeenCalledWith({
        include: { class: true },
        orderBy: { lastName: 'asc' },
      });
    });

    it('stamps the tenant id on creation', async () => {
      await new StudentService(prisma as any).create({ firstName: 'Awa' }, 'tenant-1');
      expect(tx.student.create).toHaveBeenCalledWith({
        data: { firstName: 'Awa', tenantId: 'tenant-1' },
      });
    });

    it('returns the student when found', async () => {
      tx.student.findUnique.mockResolvedValue({ id: 'st1' });
      await expect(new StudentService(prisma as any).findOne('st1')).resolves.toEqual({ id: 'st1' });
    });

    it('throws when the student does not exist', async () => {
      tx.student.findUnique.mockResolvedValue(null);
      await expect(new StudentService(prisma as any).findOne('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('ClassService', () => {
    it('lists classes with their student count', async () => {
      await new ClassService(prisma as any).findAll();
      expect(tx.class.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: { _count: { select: { students: true } } },
      });
    });

    it('stamps the tenant id on creation', async () => {
      await new ClassService(prisma as any).create({ name: '6e A' }, 'tenant-1');
      expect(tx.class.create).toHaveBeenCalledWith({
        data: { name: '6e A', tenantId: 'tenant-1' },
      });
    });
  });

  describe('CourseService', () => {
    it('lists and creates courses under the tenant context', async () => {
      const service = new CourseService(prisma as any);
      await service.findAll();
      await service.create({ name: 'Maths' }, 'tenant-1');
      expect(tx.course.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
      expect(tx.course.create).toHaveBeenCalledWith({
        data: { name: 'Maths', tenantId: 'tenant-1' },
      });
    });
  });

  describe('TeacherService', () => {
    it('lists and creates teachers under the tenant context', async () => {
      const service = new TeacherService(prisma as any);
      await service.findAll();
      await service.create({ lastName: 'Fall' }, 'tenant-1');
      expect(tx.teacher.findMany).toHaveBeenCalledWith({ orderBy: { lastName: 'asc' } });
      expect(tx.teacher.create).toHaveBeenCalledWith({
        data: { lastName: 'Fall', tenantId: 'tenant-1' },
      });
    });
  });

  describe('TimetableService', () => {
    it('lists slots ordered by day then start time with their relations', async () => {
      await new TimetableService(prisma as any).findAll();
      expect(tx.timetable.findMany).toHaveBeenCalledWith({
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        include: { class: true, course: true, teacher: true },
      });
    });

    it('stamps the tenant id on creation', async () => {
      await new TimetableService(prisma as any).create({ dayOfWeek: 1 }, 'tenant-1');
      expect(tx.timetable.create).toHaveBeenCalledWith({
        data: { dayOfWeek: 1, tenantId: 'tenant-1' },
      });
    });
  });

  describe('TenantClassesService', () => {
    it('relies on RLS and does not pass a tenant id explicitly', async () => {
      const service = new TenantClassesService(prisma as any);
      await service.findAll();
      await service.create('6e A', 'C6A');
      expect(tx.class.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { students: true } } },
      });
      expect(tx.class.create).toHaveBeenCalledWith({ data: { name: '6e A', code: 'C6A' } });
    });
  });
});
