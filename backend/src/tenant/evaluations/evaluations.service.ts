import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters: { classId?: string; courseId?: string; semester?: number }) {
    return this.prisma.evaluation.findMany({
      where: {
        tenantId,
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.courseId && { courseId: filters.courseId }),
        ...(filters.semester && { semester: filters.semester }),
      },
      include: {
        class: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true, coefficient: true } },
        _count: { select: { grades: true } },
      },
      orderBy: [{ semester: 'asc' }, { date: 'desc' }],
    });
  }

  async create(tenantId: string, dto: any) {
    return this.prisma.evaluation.create({
      data: {
        tenantId,
        classId: dto.classId,
        courseId: dto.courseId,
        title: dto.title,
        type: dto.type ?? 'DEVOIR',
        date: new Date(dto.date),
        coefficient: dto.coefficient ?? 1,
        maxScore: dto.maxScore ?? 20,
        semester: dto.semester ?? 1,
      },
    });
  }

  async getGrades(tenantId: string, evaluationId: string) {
    const evaluation = await this.prisma.evaluation.findFirst({
      where: { id: evaluationId, tenantId },
      include: {
        class: { include: { students: { orderBy: { lastName: 'asc' } } } },
        grades: true,
      },
    });
    if (!evaluation) throw new NotFoundException('Évaluation introuvable');

    // Retourner la liste complète des élèves avec leur note (ou null si absent)
    return {
      evaluation: {
        id: evaluation.id,
        title: evaluation.title,
        type: evaluation.type,
        date: evaluation.date,
        maxScore: evaluation.maxScore,
        coefficient: evaluation.coefficient,
        semester: evaluation.semester,
        class: evaluation.class,
      },
      entries: evaluation.class.students.map((student) => {
        const grade = evaluation.grades.find((g) => g.studentId === student.id);
        return {
          studentId: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          score: grade?.score ?? null,
          comment: grade?.comment ?? null,
          gradeId: grade?.id ?? null,
        };
      }),
    };
  }

  async upsertGrades(tenantId: string, evaluationId: string, grades: { studentId: string; score: number | null; comment?: string }[]) {
    const ops = grades.map((g) =>
      this.prisma.grade.upsert({
        where: { evaluationId_studentId: { evaluationId, studentId: g.studentId } },
        create: { tenantId, evaluationId, studentId: g.studentId, score: g.score, comment: g.comment },
        update: { score: g.score, comment: g.comment },
      }),
    );
    return this.prisma.$transaction(ops);
  }

  async getClassAverages(tenantId: string, classId: string, semester: number) {
    const students = await this.prisma.student.findMany({
      where: { tenantId, classId },
      select: {
        id: true, firstName: true, lastName: true,
        grades: {
          include: {
            evaluation: {
              include: { course: { select: { name: true, code: true, coefficient: true } } },
            },
          },
          where: { evaluation: { classId, semester, tenantId } },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    return students.map((s) => {
      let totalWeighted = 0;
      let totalCoef = 0;
      const bySubject: Record<string, { courseName: string; average: number; coef: number }> = {};

      s.grades.forEach((g) => {
        if (g.score === null) return;
        const coef = g.evaluation.coefficient * g.evaluation.course.coefficient;
        const norm = (g.score / g.evaluation.maxScore) * 20; // ramener sur 20
        totalWeighted += norm * coef;
        totalCoef += coef;

        const key = g.evaluation.courseId;
        if (!bySubject[key]) {
          bySubject[key] = { courseName: g.evaluation.course.name, average: 0, coef: g.evaluation.course.coefficient };
        }
      });

      const generalAverage = totalCoef > 0 ? Math.round((totalWeighted / totalCoef) * 100) / 100 : null;
      return {
        studentId: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        generalAverage,
        subjects: Object.values(bySubject),
      };
    });
  }
}
