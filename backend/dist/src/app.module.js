"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const tenant_middleware_1 = require("./common/tenancy/tenant.middleware");
const tenant_module_1 = require("./tenant/tenant.module");
const student_module_1 = require("./tenant/student/student.module");
const teacher_module_1 = require("./tenant/teacher/teacher.module");
const course_module_1 = require("./tenant/course/course.module");
const timetable_module_1 = require("./tenant/timetable/timetable.module");
const mail_module_1 = require("./mail/mail.module");
const signup_module_1 = require("./signup/signup.module");
const platform_module_1 = require("./platform/platform.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_middleware_1.TenantMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            tenant_module_1.TenantModule,
            student_module_1.StudentModule,
            teacher_module_1.TeacherModule,
            course_module_1.CourseModule,
            timetable_module_1.TimetableModule,
            mail_module_1.MailModule,
            signup_module_1.PublicSignupModule,
            platform_module_1.PlatformModule,
        ],
        controllers: [],
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map