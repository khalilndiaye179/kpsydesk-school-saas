-- AlterTable SchoolFee add classId with relation
ALTER TABLE "SchoolFee" ADD COLUMN IF NOT EXISTS "classId" UUID;

-- CreateTable TransportRoute
CREATE TABLE IF NOT EXISTS "TransportRoute" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "vehiclePlate" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 25000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable TransportSubscription
CREATE TABLE IF NOT EXISTS "TransportSubscription" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "routeId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "stopName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportSubscription_pkey" PRIMARY KEY ("id")
);

-- Unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "TransportSubscription_routeId_studentId_key" ON "TransportSubscription"("routeId", "studentId");

-- AddForeignKey
ALTER TABLE "SchoolFee" ADD CONSTRAINT "SchoolFee_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey TransportRoute
ALTER TABLE "TransportRoute" ADD CONSTRAINT "TransportRoute_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey TransportSubscription
ALTER TABLE "TransportSubscription" ADD CONSTRAINT "TransportSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransportSubscription" ADD CONSTRAINT "TransportSubscription_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TransportRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransportSubscription" ADD CONSTRAINT "TransportSubscription_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
