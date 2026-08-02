import { Module } from '@nestjs/common';
import { PublicSignupController } from './signup.controller';
import { PublicSignupService } from './signup.service';
import { PrismaService } from '../prisma.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [PublicSignupController],
  providers: [PublicSignupService, PrismaService],
})
export class PublicSignupModule {}
