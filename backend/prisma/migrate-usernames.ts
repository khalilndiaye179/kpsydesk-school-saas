import { PrismaClient } from '@prisma/client';
import { generateTenantCodeSlug } from '../src/common/utils/tenant-code.util';

const prisma = new PrismaClient();

async function migrateUsernames() {
  console.log('--- DEBUT DE LA MIGRATION DES USERNAMES DES TENANTS ---');

  // 1. Migrer les Tenants qui n'ont pas encore de code
  const tenants = await prisma.tenant.findMany();
  console.log(`Nombre de tenants à vérifier : ${tenants.length}`);

  for (const tenant of tenants) {
    if (!tenant.code) {
      let baseCode = generateTenantCodeSlug(tenant.name);
      let code = baseCode;
      let idx = 1;

      while (await prisma.tenant.findFirst({ where: { code, id: { not: tenant.id } } })) {
        code = `${baseCode}${idx}`;
        idx++;
      }

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { code },
      });
      console.log(`[Tenant] Code attribué pour ${tenant.name} -> ${code}`);
    }
  }

  // 2. Migrer les TenantUser existants sans username
  const updatedTenants = await prisma.tenant.findMany({
    include: {
      users: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  for (const tenant of updatedTenants) {
    console.log(`\n-- Traitement des utilisateurs pour le Tenant: ${tenant.name} (${tenant.code}) --`);
    let seq = 1;

    for (const user of tenant.users) {
      const sequenceStr = String(seq).padStart(4, '0');
      const generatedUsername = `${tenant.code}-${sequenceStr}`;

      await prisma.tenantUser.update({
        where: { id: user.id },
        data: { username: generatedUsername },
      });

      console.log(`  User ID: ${user.id} | Email: ${user.email} -> USERNAME: ${generatedUsername}`);
      seq++;
    }
  }

  console.log('\n--- MIGRATION DES USERNAMES TERMINEE AVEC SUCCES ---');
}

migrateUsernames()
  .catch((err) => {
    console.error('Erreur lors de la migration des usernames:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
