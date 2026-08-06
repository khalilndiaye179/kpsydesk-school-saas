import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const env = (process.env.NODE_ENV || process.env.ENVIRONMENT || 'development').toLowerCase();
  if (env === 'production') {
    console.error('⛔ ERREUR SÉCURITÉ: L\'exécution de scripts de seed est strictement interdite en environnement de production (NODE_ENV=production).');
    process.exit(1);
  }

  const email = process.env.INITIAL_SUPERADMIN_EMAIL;
  const password = process.env.INITIAL_SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ERREUR: Les variables d\'environnement INITIAL_SUPERADMIN_EMAIL et INITIAL_SUPERADMIN_PASSWORD doivent être définies.');
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
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
