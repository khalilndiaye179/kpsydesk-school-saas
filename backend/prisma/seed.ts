import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding database...');

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'neguinho.ndiaye@gmail.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Neguinho179@#@';

  // Hachage du mot de passe
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(superAdminPassword, salt);

  // Création du Super Admin initial dans la table globale PlatformUser
  const existingAdmin = await prisma.platformUser.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingAdmin) {
    await prisma.platformUser.create({
      data: {
        email: superAdminEmail,
        passwordHash: passwordHash,
        role: 'SUPER_ADMIN',
        isTwoFactorEnabled: false, // 2FA requis à la 1re connexion
      },
    });
    console.log(`✅ Platform Super Admin created: ${superAdminEmail}`);
  } else {
    console.log(`ℹ️ Platform Super Admin already exists: ${superAdminEmail}`);
  }

  // Création d'un premier tenant exemple pour les phases de test à venir
  const existingTenant = await prisma.tenant.findFirst({
    where: { subdomain: 'demo' },
  });

  if (!existingTenant) {
    const demoTenant = await prisma.tenant.create({
      data: {
        name: 'Établissement Démo',
        subdomain: 'demo',
        status: 'TRIAL',
        plan: 'TRIAL_7D',
      },
    });
    console.log(`✅ Demo Tenant created: ${demoTenant.name} (subdomain: demo)`);

    // Création d'un Directeur dans le tenant
    const tenantUserEmail = 'director@demo.com';
    const tenantUserPassHash = await bcrypt.hash('DemoPassword123!', salt);
    await prisma.tenantUser.create({
      data: {
        tenantId: demoTenant.id,
        email: tenantUserEmail,
        passwordHash: tenantUserPassHash,
        role: 'DIRECTOR',
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Demo Tenant Director created: ${tenantUserEmail}`);
  }

  console.log('🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
