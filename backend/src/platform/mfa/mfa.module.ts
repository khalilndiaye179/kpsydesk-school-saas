import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { PrismaService } from '../../prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kpsydesk_jwt_super_secret_key_change_me_in_production',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [MfaController],
  providers: [MfaService, PrismaService],
  exports: [MfaService],
})
export class MfaModule {}
