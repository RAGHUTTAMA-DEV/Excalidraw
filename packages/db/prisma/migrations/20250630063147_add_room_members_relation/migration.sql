-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';
