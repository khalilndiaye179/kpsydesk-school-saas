-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT NOT NULL DEFAULT 'La plateforme KPSyDesk SaaS est actuellement en maintenance planifiée pour amélioration de nos services. Seuls les administrateurs globaux sont autorisés.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- Insert Default Row
INSERT INTO "SystemConfig" ("id", "maintenanceMode", "maintenanceMessage", "updatedAt")
VALUES ('global', false, 'La plateforme KPSyDesk SaaS est actuellement en maintenance planifiée pour amélioration de nos services. Seuls les administrateurs globaux sont autorisés.', NOW())
ON CONFLICT ("id") DO NOTHING;
