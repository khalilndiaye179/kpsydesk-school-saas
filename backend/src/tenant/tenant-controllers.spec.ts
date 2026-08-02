import { ClassController } from './class/class.controller';
import { CourseController } from './course/course.controller';
import { TeacherController } from './teacher/teacher.controller';
import { TimetableController } from './timetable/timetable.controller';
import { TenantClassesController } from './classes/tenant-classes.controller';

const request = { user: { tenantId: 'tenant-1' } } as any;

describe('tenant CRUD controllers', () => {
  const service = () => ({
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'x' }),
  });

  it.each([
    ['ClassController', (s: any) => new ClassController(s)],
    ['CourseController', (s: any) => new CourseController(s)],
    ['TeacherController', (s: any) => new TeacherController(s)],
    ['TimetableController', (s: any) => new TimetableController(s)],
  ])('%s forwards the tenant id from the request user', async (_name, build) => {
    const svc = service();
    const controller: any = build(svc);

    await controller.findAll();
    await controller.create({ name: 'X' }, request);

    expect(svc.findAll).toHaveBeenCalled();
    expect(svc.create).toHaveBeenCalledWith({ name: 'X' }, 'tenant-1');
  });

  it('TenantClassesController passes name and code positionally', async () => {
    const svc = service();
    const controller = new TenantClassesController(svc as any);

    await controller.findAll();
    await controller.create({ name: '6e A', code: 'C6A' });

    expect(svc.findAll).toHaveBeenCalled();
    expect(svc.create).toHaveBeenCalledWith('6e A', 'C6A');
  });
});
