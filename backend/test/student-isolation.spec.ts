import { StudentService } from '../src/tenant/student/student.service';
import { NotFoundException } from '@nestjs/common';

describe('Student Service - Multi-Tenant Isolation Protection', () => {
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

  it('should REJECT update if student UUID belongs to another Tenant B', async () => {
    // Tenant A tente de modifier l'élève id 'student-uuid-tenant-b'
    mockPrisma.student.findFirst.mockResolvedValue(null); // findFirst({ where: { id: 'student-uuid-tenant-b', tenantId: 'tenant-a' } }) renvoie null

    await expect(
      studentService.update('student-uuid-tenant-b', { firstName: 'Pirate' }, 'tenant-a')
    ).rejects.toThrow(NotFoundException);

    expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
      where: { id: 'student-uuid-tenant-b', tenantId: 'tenant-a' },
    });
    expect(mockPrisma.student.update).not.toHaveBeenCalled();
  });

  it('should REJECT deletion if student UUID belongs to another Tenant B', async () => {
    // Tenant A tente de supprimer l'élève id 'student-uuid-tenant-b'
    mockPrisma.student.findFirst.mockResolvedValue(null); // findFirst renvoie null car l'élève appartient à tenant-b

    await expect(
      studentService.remove('student-uuid-tenant-b', 'tenant-a')
    ).rejects.toThrow(NotFoundException);

    expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
      where: { id: 'student-uuid-tenant-b', tenantId: 'tenant-a' },
    });
    expect(mockPrisma.student.delete).not.toHaveBeenCalled();
  });
});
