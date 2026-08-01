"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Start seeding database...');
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'neguinho.ndiaye@gmail.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Neguinho179@#@';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(superAdminPassword, salt);
    const existingAdmin = await prisma.platformUser.findUnique({
        where: { email: superAdminEmail },
    });
    if (!existingAdmin) {
        await prisma.platformUser.create({
            data: {
                email: superAdminEmail,
                passwordHash: passwordHash,
                role: 'SUPER_ADMIN',
                isTwoFactorEnabled: false,
            },
        });
        console.log(`✅ Platform Super Admin created: ${superAdminEmail}`);
    }
    else {
        console.log(`ℹ️ Platform Super Admin already exists: ${superAdminEmail}`);
    }
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
//# sourceMappingURL=seed.js.map