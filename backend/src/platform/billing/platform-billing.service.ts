import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PaymentProofStatus, SubscriptionStatus } from '@prisma/client';

export interface SubmitPaymentProofDto {
  planId?: string;
  planCode: string;
  amount: number;
  currency?: string;
  paymentMethodId: string;
  transactionReference?: string;
  proofFileUrl: string;
}

@Injectable()
export class PlatformBillingService {
  private readonly logger = new Logger(PlatformBillingService.name);

  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // 1. ENDPOINTS PUBLICS
  // ---------------------------------------------------------------------------
  async getPublicPlans() {
    return this.prisma.plan.findMany({
      where: { isPublic: true, isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async getPublicPaymentMethods() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  // ---------------------------------------------------------------------------
  // 2. SOUMISSION DE PREUVE CÔTÉ TENANT
  // ---------------------------------------------------------------------------
  async submitPaymentProof(tenantId: string, dto: SubmitPaymentProofDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Établissement introuvable.');
    }

    // Vérification de la méthode de paiement
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.paymentMethodId },
    });
    if (!method || !method.isActive) {
      throw new BadRequestException('Moyen de paiement invalide ou désactivé.');
    }

    // Récupération de l'abonnement courant s'il existe
    const currentSub = await this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const proof = await this.prisma.paymentProof.create({
      data: {
        tenantId,
        subscriptionId: currentSub?.id,
        planId: dto.planId,
        planCode: dto.planCode,
        amount: Number(dto.amount),
        currency: dto.currency || 'XOF',
        requestedQuota: dto.requestedQuota || 500,
        paymentMethodId: dto.paymentMethodId,
        transactionReference: dto.transactionReference,
        proofFileUrl: dto.proofFileUrl,
        status: PaymentProofStatus.PENDING,
      },
      include: {
        paymentMethod: true,
        plan: true,
      },
    });

    this.logger.log(`💳 Nouvelle preuve de paiement soumise (ID: ${proof.id}) pour l'établissement ${tenant.name}`);

    return {
      message: 'Votre preuve de paiement a été transmise au service financier. Elle sera vérifiée sous 24h.',
      proof,
    };
  }

  async getTenantPaymentProofs(tenantId: string) {
    return this.prisma.paymentProof.findMany({
      where: { tenantId },
      include: {
        paymentMethod: true,
        plan: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------------
  // 3. GESTION SUPER ADMIN — FILE D'ATTENTE DES PREUVES
  // ---------------------------------------------------------------------------
  async getAdminPaymentProofs(status?: PaymentProofStatus, page = 1, limit = 20) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.paymentProof.count({ where }),
      this.prisma.paymentProof.findMany({
        where,
        include: {
          tenant: {
            select: { id: true, name: true, code: true, subdomain: true, status: true, country: true },
          },
          paymentMethod: true,
          plan: true,
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async approvePaymentProof(proofId: string, adminId: string) {
    const proof = await this.prisma.paymentProof.findUnique({
      where: { id: proofId },
      include: { tenant: true },
    });

    if (!proof) {
      throw new NotFoundException('Preuve de paiement introuvable.');
    }

    if (proof.status !== PaymentProofStatus.PENDING) {
      throw new BadRequestException(`Cette preuve est déjà dans le statut ${proof.status}`);
    }

    // Trouver le modèle Plan correspondant par ID ou Code
    let targetPlan = proof.planId
      ? await this.prisma.plan.findUnique({ where: { id: proof.planId } })
      : await this.prisma.plan.findUnique({ where: { name: proof.planCode } });

    // Transaction d'activation atomique
    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Mettre à jour la preuve
      const updatedProof = await tx.paymentProof.update({
        where: { id: proofId },
        data: {
          status: PaymentProofStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedByAdminId: adminId,
        },
      });

      // 2. Mettre à jour le tenant en statut ACTIVE et lier au Plan et au Quota autorisé
      await tx.tenant.update({
        where: { id: proof.tenantId },
        data: {
          status: 'ACTIVE',
          planId: targetPlan?.id,
          plan: (proof.planCode as any) || 'Pro (Full Pack)',
          quotaStudents: proof.requestedQuota || 500,
        },
      });

      // 3. Créer ou mettre à jour la Subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // + 1 mois par défaut

      await tx.subscription.create({
        data: {
          tenantId: proof.tenantId,
          planId: targetPlan ? targetPlan.id : (await tx.plan.findFirst())!.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate,
          billingInterval: 'MONTHLY',
        },
      });

      return updatedProof;
    });

    this.logger.log(`✅ Preuve de paiement ${proofId} APPROUVÉE par l'admin ${adminId}. Établissement ${proof.tenant.name} activé.`);

    return {
      message: `Paiement validé avec succès. L'établissement "${proof.tenant.name}" est désormais ACTIF.`,
      proof: updated,
    };
  }

  async rejectPaymentProof(proofId: string, adminId: string, rejectionReason: string) {
    const proof = await this.prisma.paymentProof.findUnique({
      where: { id: proofId },
      include: { tenant: true },
    });

    if (!proof) {
      throw new NotFoundException('Preuve de paiement introuvable.');
    }

    if (proof.status !== PaymentProofStatus.PENDING) {
      throw new BadRequestException(`Cette preuve est déjà dans le statut ${proof.status}`);
    }

    const updated = await this.prisma.paymentProof.update({
      where: { id: proofId },
      data: {
        status: PaymentProofStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedByAdminId: adminId,
        rejectionReason: rejectionReason || 'Paiement non reçu ou référence invalide.',
      },
    });

    this.logger.log(`❌ Preuve de paiement ${proofId} REJETÉE par l'admin ${adminId}. Motif: ${rejectionReason}`);

    return {
      message: `Preuve de paiement rejetée. Motif communiqué à l'établissement.`,
      proof: updated,
    };
  }

  // ---------------------------------------------------------------------------
  // 4. ADMIN CRUD DE GESTION DES PLANS & PAYMENT METHODS
  // ---------------------------------------------------------------------------
  async getAllPlansAdmin() {
    return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
  }

  async createPlanAdmin(dto: any) {
    return this.prisma.plan.create({ data: dto });
  }

  async updatePlanAdmin(id: string, dto: any) {
    return this.prisma.plan.update({ where: { id }, data: dto });
  }

  async getAllPaymentMethodsAdmin() {
    return this.prisma.paymentMethod.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  async createPaymentMethodAdmin(dto: any) {
    return this.prisma.paymentMethod.create({ data: dto });
  }

  async updatePaymentMethodAdmin(id: string, dto: any) {
    return this.prisma.paymentMethod.update({ where: { id }, data: dto });
  }
}
