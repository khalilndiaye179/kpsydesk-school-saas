import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.INITIAL_SUPERADMIN_EMAIL;
  const password = process.env.INITIAL_SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ERREUR SÉCURITÉ CRITIQUE: Les variables INITIAL_SUPERADMIN_EMAIL et INITIAL_SUPERADMIN_PASSWORD sont obligatoires pour le seed.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.platformUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      isTwoFactorEnabled: false,
      isMfaEnrolled: false,
      mustChangePassword: true,
    },
  });

  console.log(`✅ Compte SuperAdmin initial créé avec succès pour ${user.email} (id: ${user.id})`);

  // Seed des Plans SaaS
  const defaultPlans = [
    {
      name: 'STANDARD',
      price: 25000,
      quotaStudents: 350,
      description: 'Gestion essentielle : élèves, bulletins & pointage kiosque.',
      features: ['Gestion Scolaire de base', 'Absences & Bulletins', 'Pointage Kiosque QR'],
      annualDiscountPct: 20.0,
      isPublic: true,
      isActive: true,
    },
    {
      name: 'PREMIUM',
      price: 50000,
      quotaStudents: 2000,
      description: 'Gestion complète avec RH et comptabilité.',
      features: ['Gestion Scolaire complète', 'Module Financier & Paie RH', 'Kiosque Pointage', 'Messagerie Parents'],
      annualDiscountPct: 20.0,
      isPublic: true,
      isActive: true,
    },
    {
      name: 'PRO',
      price: 75000,
      quotaStudents: 99999,
      description: 'Haute performance et multi-établissements.',
      features: ['Tout le Plan Premium', 'Multi-campuses', 'Exports Illimités', 'Support Prioritaire 24/7'],
      annualDiscountPct: 20.0,
      isPublic: true,
      isActive: true,
    },
  ];

  for (const planData of defaultPlans) {
    await prisma.plan.upsert({
      where: { name: planData.name },
      update: {
        price: planData.price,
        quotaStudents: planData.quotaStudents,
        description: planData.description,
        features: planData.features,
      },
      create: planData,
    });
  }
  console.log('✅ Plans SaaS initialisés avec succès');

  // Seed des Moyens de Paiement par défaut
  const defaultMethods = [
    {
      code: 'WAVE',
      label: 'Wave Mobile Money',
      instructions: 'Envoyer le règlement au numéro marchand Wave : +221 76 261 39 39 (KPSY Informatique). Renseignez la référence de transaction.',
      iconColor: '#00c3ff',
      displayOrder: 1,
      isActive: true,
    },
    {
      code: 'ORANGE_MONEY',
      label: 'Orange Money',
      instructions: 'Règlement par Orange Money au +221 77 123 45 67 / Code Marchand 987654. Indiquez la référence du SMS de confirmation.',
      iconColor: '#ff6600',
      displayOrder: 2,
      isActive: true,
    },
    {
      code: 'VIREMENT',
      label: 'Virement Bancaire (RIB)',
      instructions: 'Virement bancaire sur le compte CBAO/Orabank SN. IBAN: SN012 01001 12345678901 45. Joindre l\'ordre de virement tamponné.',
      iconColor: '#2563eb',
      displayOrder: 3,
      isActive: true,
    },
    {
      code: 'AUTRE',
      label: 'Chèque / Espèces à l\'agence',
      instructions: 'Paiement direct à notre agence KPSY Informatique Dakar. Renseigner le numéro de reçu délivré.',
      iconColor: '#10b981',
      displayOrder: 4,
      isActive: true,
    },
  ];

  for (const methodData of defaultMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: methodData.code },
      update: {
        label: methodData.label,
        instructions: methodData.instructions,
        iconColor: methodData.iconColor,
      },
      create: methodData,
    });
  }
  console.log('✅ Moyens de paiement par défaut initialisés avec succès');

  // Ajustement du tenant Lycée Seydou Nourou TALL au statut DEMO
  const lsnTenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { subdomain: { contains: 'seydou-nourou', mode: 'insensitive' } },
        { code: 'LSN' },
        { name: { contains: 'Seydou Nourou', mode: 'insensitive' } }
      ]
    }
  });

  if (lsnTenant) {
    await prisma.tenant.update({
      where: { id: lsnTenant.id },
      data: {
        plan: 'DEMO',
        status: 'ACTIVE'
      }
    });
    console.log(`✅ Tenant ${lsnTenant.name} (${lsnTenant.subdomain}) mis à jour avec le statut/plan DEMO.`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
