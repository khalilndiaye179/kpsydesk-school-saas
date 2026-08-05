import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Script de test d'isolation pour s'assurer que le cloisonnement PostgreSQL RLS
 * empêche toute fuite de données entre différents tenants.
 */
async function testRLSIsolation() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  console.log('🧪 Starting RLS Isolation tests...');

  try {
    // 1. Création de deux tenants distincts pour le test
    const tenantA = await prisma.tenant.create({
      data: {
        name: 'Établissement A',
        code: 'TNA',
        subdomain: 'tenant-a',
      },
    });

    const tenantB = await prisma.tenant.create({
      data: {
        name: 'Établissement B',
        code: 'TNB',
        subdomain: 'tenant-b',
      },
    });

    console.log(`✅ Tenants created: A(${tenantA.id}) and B(${tenantB.id})`);

    // 2. Création d'utilisateurs rattachés à chaque tenant
    // Note : On fait cela sans RLS actif temporairement ou en bypassant pour l'écriture initiale de test,
    // ou en appliquant le bon tenant_id via transaction pour l'insertion.
    
    // Insertion pour Tenant A
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantA.id}';`);
      await tx.tenantUser.create({
        data: {
          tenantId: tenantA.id,
          username: 'TNA-0001',
          email: 'user@tenant-a.com',
          passwordHash: 'secret-a',
        },
      });
    });

    // Insertion pour Tenant B
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantB.id}';`);
      await tx.tenantUser.create({
        data: {
          tenantId: tenantB.id,
          username: 'TNB-0001',
          email: 'user@tenant-b.com',
          passwordHash: 'secret-b',
        },
      });
    });

    console.log('✅ Users registered inside their respective tenant contexts');

    // 3. Simulation d'une session HTTP/SQL sur le contexte de Tenant A
    console.log('🔍 Executing query within Tenant A session context...');
    
    const tenantAUsersResult = await prisma.$transaction(async (tx) => {
      // Configuration de la session PostgreSQL sur le Tenant A
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantA.id}';`);
      return await tx.tenantUser.findMany();
    });

    console.log(`   Found ${tenantAUsersResult.length} user(s) in Tenant A context.`);
    
    // Vérification : Tenant A ne doit voir que ses utilisateurs
    const hasTenantBUser = tenantAUsersResult.some(u => u.tenantId === tenantB.id);
    if (hasTenantBUser) {
      throw new Error('❌ FAILURE: Tenant A context can see Tenant B data!');
    }
    console.log('✅ SUCCESS: Tenant A context is isolated from Tenant B data.');

    // 4. Tentative de piratage / insertion croisée
    console.log('🔒 Testing CROSS-TENANT write restriction...');
    try {
      await prisma.$transaction(async (tx) => {
        // Session configurée sur Tenant A
        await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantA.id}';`);
        // Tentative d'insertion d'une ligne pour le Tenant B dans la session du Tenant A
        await tx.tenantUser.create({
          data: {
            tenantId: tenantB.id, // ID différent de la session !
            email: 'malicious@tenant-b.com',
            username: 'TNB-9999',
            passwordHash: 'hack',
          },
        });
      });
      throw new Error('❌ FAILURE: Database allowed writing data for Tenant B under Tenant A session!');
    } catch (err: any) {
      if (err.message && err.message.includes('FAILURE')) {
        throw err;
      }
      console.log('✅ SUCCESS: Database rejected cross-tenant write (RLS policy block).');
    }

    // Nettoyage des données de test
    // (Puisque les tables de tests sont globales/cascadées, on nettoie en cascade à partir des Tenants)
    await prisma.tenant.delete({ where: { id: tenantA.id } });
    await prisma.tenant.delete({ where: { id: tenantB.id } });
    console.log('🧹 Test data cleaned up.');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRLSIsolation();
