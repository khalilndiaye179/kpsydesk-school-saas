-- DropIndex
DROP INDEX IF EXISTS "TenantUser_tenantId_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "TenantUser_email_key" ON "TenantUser"("email");
