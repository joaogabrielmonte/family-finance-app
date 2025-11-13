-- DropForeignKey
ALTER TABLE "public"."Family" DROP CONSTRAINT "Family_ownerId_fkey";

-- AlterTable
ALTER TABLE "Family" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
