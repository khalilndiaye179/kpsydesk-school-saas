"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();
async function testRLSIsolation() {
    const prisma = new client_1.PrismaClient();
    await prisma.$connect();
    console.log('🧪 Starting RLS Isolation tests...');
    try {
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
        console.log('🔍 Executing query within Tenant A session context...');
        const tenantAUsersResult = await prisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantA.id}';`);
            return await tx.tenantUser.findMany();
        });
        console.log(`   Found ${tenantAUsersResult.length} user(s) in Tenant A context.`);
        const hasTenantBUser = tenantAUsersResult.some(u => u.tenantId === tenantB.id);
        if (hasTenantBUser) {
            throw new Error('❌ FAILURE: Tenant A context can see Tenant B data!');
        }
        console.log('✅ SUCCESS: Tenant A context is isolated from Tenant B data.');
        console.log('🔒 Testing CROSS-TENANT write restriction...');
        try {
            await prisma.$transaction(async (tx) => {
                await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantA.id}';`);
                await tx.tenantUser.create({
                    data: {
                        tenantId: tenantB.id,
                        email: 'malicious@tenant-b.com',
                        username: 'TNB-9999',
                        passwordHash: 'hack',
                    },
                });
            });
            throw new Error('❌ FAILURE: Database allowed writing data for Tenant B under Tenant A session!');
        }
        catch (err) {
            if (err.message && err.message.includes('FAILURE')) {
                throw err;
            }
            console.log('✅ SUCCESS: Database rejected cross-tenant write (RLS policy block).');
        }
        await prisma.tenant.delete({ where: { id: tenantA.id } });
        await prisma.tenant.delete({ where: { id: tenantB.id } });
        console.log('🧹 Test data cleaned up.');
    }
    catch (error) {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
testRLSIsolation();
//# sourceMappingURL=test-isolation.js.map