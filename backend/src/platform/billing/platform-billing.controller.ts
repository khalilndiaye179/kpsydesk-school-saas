import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../../tenant/auth/jwt-auth.guard';
import { Public } from '../../tenant/auth/public.decorator';
import { PlatformBillingService } from './platform-billing.service';
import { PaymentProofStatus } from '@prisma/client';

// Dossier de destination du volume Docker /app/uploads/payment-proofs/
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'payment-proofs');

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuration sécurisée de Multer
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const fileExt = extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${fileExt}`;
    cb(null, uniqueName);
  },
});

@Controller()
export class PlatformBillingController {
  constructor(private readonly billingService: PlatformBillingService) {}

  // ---------------------------------------------------------------------------
  // 1. ENDPOINTS PUBLICS (Accessibles sans Auth)
  // ---------------------------------------------------------------------------
  @Get('public/plans')
  @Public()
  getPublicPlans() {
    return this.billingService.getPublicPlans();
  }

  @Get('public/payment-methods')
  @Public()
  getPublicPaymentMethods() {
    return this.billingService.getPublicPaymentMethods();
  }

  // ---------------------------------------------------------------------------
  // 2. ENDPOINTS CÔTÉ TENANT (Authentifiés JWT)
  // ---------------------------------------------------------------------------
  @Post('tenant/billing/submit-payment-proof')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Format de fichier non supporté. Veuillez joindre une image (JPG, PNG) ou un document PDF.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async submitPaymentProof(
    @Req() req: { tenantId?: string; user?: { tenantId?: string } },
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Contexte établissement manquant.');
    }

    if (!file) {
      throw new BadRequestException('Veuillez joindre votre récépissé ou preuve de règlement (image ou PDF).');
    }

    const relativeProofUrl = `/uploads/payment-proofs/${file.filename}`;

    return this.billingService.submitPaymentProof(tenantId, {
      planId: body.planId,
      planCode: body.planCode || 'STANDARD',
      amount: body.amount,
      currency: body.currency || 'XOF',
      paymentMethodId: body.paymentMethodId,
      transactionReference: body.transactionReference,
      proofFileUrl: relativeProofUrl,
    });
  }

  @Get('tenant/billing/proofs')
  @UseGuards(JwtAuthGuard)
  getTenantPaymentProofs(@Req() req: { tenantId?: string; user?: { tenantId?: string } }) {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Contexte établissement manquant.');
    }
    return this.billingService.getTenantPaymentProofs(tenantId);
  }

  // ---------------------------------------------------------------------------
  // 3. ENDPOINTS SUPER ADMIN — FILE D'ATTENTE & VALDATION
  // ---------------------------------------------------------------------------
  @Get('admin/payment-proofs')
  @UseGuards(JwtAuthGuard)
  getAdminPaymentProofs(
    @Query('status') status?: PaymentProofStatus,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.billingService.getAdminPaymentProofs(
      status,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Put('admin/payment-proofs/:id/approve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  approvePaymentProof(
    @Param('id') id: string,
    @Req() req: { user: { id?: string; email: string } },
  ) {
    const adminId = req.user.id || 'system-admin';
    return this.billingService.approvePaymentProof(id, adminId);
  }

  @Put('admin/payment-proofs/:id/reject')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  rejectPaymentProof(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
    @Req() req: { user: { id?: string; email: string } },
  ) {
    const adminId = req.user.id || 'system-admin';
    return this.billingService.rejectPaymentProof(id, adminId, rejectionReason);
  }

  // ---------------------------------------------------------------------------
  // 4. ENDPOINTS SUPER ADMIN — GESTION DES PLANS & PAYMENT METHODS
  // ---------------------------------------------------------------------------
  @Get('admin/plans')
  @UseGuards(JwtAuthGuard)
  getAllPlansAdmin() {
    return this.billingService.getAllPlansAdmin();
  }

  @Post('admin/plans')
  @UseGuards(JwtAuthGuard)
  createPlanAdmin(@Body() body: any) {
    return this.billingService.createPlanAdmin(body);
  }

  @Put('admin/plans/:id')
  @UseGuards(JwtAuthGuard)
  updatePlanAdmin(@Param('id') id: string, @Body() body: any) {
    return this.billingService.updatePlanAdmin(id, body);
  }

  @Get('admin/payment-methods')
  @UseGuards(JwtAuthGuard)
  getAllPaymentMethodsAdmin() {
    return this.billingService.getAllPaymentMethodsAdmin();
  }

  @Post('admin/payment-methods')
  @UseGuards(JwtAuthGuard)
  createPaymentMethodAdmin(@Body() body: any) {
    return this.billingService.createPaymentMethodAdmin(body);
  }

  @Put('admin/payment-methods/:id')
  @UseGuards(JwtAuthGuard)
  updatePaymentMethodAdmin(@Param('id') id: string, @Body() body: any) {
    return this.billingService.updatePaymentMethodAdmin(id, body);
  }
}
