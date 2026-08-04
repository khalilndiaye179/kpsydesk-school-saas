-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "guardianEmail" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianPhone" TEXT,
ADD COLUMN     "guardianRelation" TEXT,
ADD COLUMN     "matricule" TEXT,
ADD COLUMN     "previousSchool" TEXT,
ADD COLUMN     "studentEmail" TEXT,
ADD COLUMN     "studentPhone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_tenantId_matricule_key" ON "Student"("tenantId", "matricule");
