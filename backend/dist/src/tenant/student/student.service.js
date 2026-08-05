"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let StudentService = class StudentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.student.findMany({
            where: { tenantId },
            include: { class: true },
            orderBy: { lastName: 'asc' },
        });
    }
    async generateMatricule(tenantId) {
        const count = await this.prisma.student.count({ where: { tenantId } });
        return `ELEV${String(count + 1).padStart(5, '0')}`;
    }
    async create(data, tenantId) {
        const matricule = data.matricule || (await this.generateMatricule(tenantId));
        return this.prisma.student.create({
            data: {
                tenantId,
                classId: data.classId,
                matricule,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email || data.studentEmail || null,
                studentPhone: data.studentPhone || null,
                studentEmail: data.studentEmail || null,
                birthDate: data.birthDate ? new Date(data.birthDate) : new Date(),
                birthPlace: data.birthPlace || null,
                previousSchool: data.previousSchool || null,
                address: data.address || null,
                guardianName: data.guardianName || null,
                guardianRelation: data.guardianRelation || null,
                guardianPhone: data.guardianPhone || null,
                guardianEmail: data.guardianEmail || null,
            },
            include: { class: true },
        });
    }
    async update(id, data, tenantId) {
        const student = await this.prisma.student.findFirst({
            where: { id, tenantId },
        });
        if (!student)
            throw new common_1.NotFoundException('Élève non trouvé');
        const updateData = {};
        if (data.classId)
            updateData.classId = data.classId;
        if (data.firstName)
            updateData.firstName = data.firstName;
        if (data.lastName)
            updateData.lastName = data.lastName;
        if (data.birthDate)
            updateData.birthDate = new Date(data.birthDate);
        if (data.matricule !== undefined)
            updateData.matricule = data.matricule;
        if (data.studentPhone !== undefined)
            updateData.studentPhone = data.studentPhone;
        if (data.studentEmail !== undefined) {
            updateData.studentEmail = data.studentEmail;
            updateData.email = data.studentEmail;
        }
        if (data.birthPlace !== undefined)
            updateData.birthPlace = data.birthPlace;
        if (data.previousSchool !== undefined)
            updateData.previousSchool = data.previousSchool;
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.guardianName !== undefined)
            updateData.guardianName = data.guardianName;
        if (data.guardianRelation !== undefined)
            updateData.guardianRelation = data.guardianRelation;
        if (data.guardianPhone !== undefined)
            updateData.guardianPhone = data.guardianPhone;
        if (data.guardianEmail !== undefined)
            updateData.guardianEmail = data.guardianEmail;
        return this.prisma.student.update({
            where: { id },
            data: updateData,
            include: { class: true },
        });
    }
    async findOne(id, tenantId) {
        const student = await this.prisma.student.findFirst({
            where: { id, tenantId },
            include: { class: true },
        });
        if (!student)
            throw new common_1.NotFoundException('Élève non trouvé');
        return student;
    }
    async remove(id, tenantId) {
        const student = await this.prisma.student.findFirst({
            where: { id, tenantId },
        });
        if (!student)
            throw new common_1.NotFoundException('Élève non trouvé');
        return this.prisma.student.delete({
            where: { id },
        });
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentService);
//# sourceMappingURL=student.service.js.map