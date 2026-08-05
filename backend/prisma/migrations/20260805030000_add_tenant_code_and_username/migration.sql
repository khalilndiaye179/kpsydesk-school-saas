-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TenantUser" ADD COLUMN "username" TEXT NOT NULL;

-- DropIndex (ancienne unicité globale sur email, si elle existait)
DROP INDEX IF EXISTS "TenantUser_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUser_tenantId_username_key" ON "TenantUser"("tenantId", "username");
