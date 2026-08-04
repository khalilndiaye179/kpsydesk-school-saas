import { TeacherService } from '../src/tenant/teacher/teacher.service';

describe('Teacher Creation & Phone Field Test', () => {
  let teacherService: TeacherService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      teacher: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    teacherService = new TeacherService(mockPrisma);
  });

  it('should create a teacher with phone field without unknown argument error', async () => {
    mockPrisma.teacher.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 't-1', ...data }));

    const result = await teacherService.create(
      {
        firstName: 'Ousmane',
        lastName: 'Sow',
        email: 'ousmane.sow@school.sn',
        phone: '+221775554433',
        specialty: 'Mathématiques',
      },
      'tenant-sn-1'
    );

    expect(result.phone).toBe('+221775554433');
    expect(result.email).toBe('ousmane.sow@school.sn');
    expect(result.specialty).toBe('Mathématiques');
    expect(result.tenantId).toBe('tenant-sn-1');
  });
});
