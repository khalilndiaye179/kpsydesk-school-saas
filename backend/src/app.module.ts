import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantMiddleware } from './common/tenancy/tenant.middleware';
import { TenantModule } from './tenant/tenant.module';
import { StudentModule } from './tenant/student/student.module';
import { TeacherModule } from './tenant/teacher/teacher.module';
import { CourseModule } from './tenant/course/course.module';
import { TimetableModule } from './tenant/timetable/timetable.module';
import { MailModule } from './mail/mail.module';
import { PublicSignupModule } from './signup/signup.module';
import { PlatformModule } from './platform/platform.module';
import { PlatformBillingModule } from './platform/billing/platform-billing.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TenantModule, 
    StudentModule, 
    TeacherModule,
    CourseModule,
    TimetableModule,
    MailModule,
    PublicSignupModule,
    PlatformModule,
    PlatformBillingModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Appliquer le middleware d'extraction du tenant à toutes les routes
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
