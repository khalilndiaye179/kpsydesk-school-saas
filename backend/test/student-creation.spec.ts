import { StudentService } from '../src/tenant/student/student.service';

describe('Student Creation & Per-Tenant Matricule Uniqueness Test', () => {
  let studentService: StudentService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      student: {
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    studentService = new StudentService(mockPrisma);
  });

  it('should auto-generate per-tenant matricule starting from ELEV00001', async () => {
    mockPrisma.student.count.mockResolvedValue(0);
    mockPrisma.student.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'std-1', ...data }));

    const result = await studentService.create(
      {
        firstName: 'Moussa',
        lastName: 'Diop',
        classId: 'cls-100',
        studentPhone: '+221771234567',
        studentEmail: 'moussa.diop@school.sn',
        guardianName: 'Ibrahima Diop',
        guardianRelation: 'Père',
        guardianPhone: '+221770000000',
        guardianEmail: 'ibrahima.diop@email.sn',
        birthDate: '2010-05-15',
        birthPlace: 'Dakar',
        previousSchool: 'École de la Paix',
        address: 'Médina, Dakar',
      },
      'tenant-sn-1'
    );

    expect(mockPrisma.student.count).toHaveBeenCalledWith({ where: { tenantId: 'tenant-sn-1' } });
    expect(result.matricule).toBe('ELEV00001');
    expect(result.tenantId).toBe('tenant-sn-1');
    expect(result.studentPhone).toBe('+221771234567');
    expect(result.guardianName).toBe('Ibrahima Diop');
  });
});
