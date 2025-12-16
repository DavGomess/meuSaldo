/*
  Warnings:

  - Changed the type of `prazo` on the `Meta` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Meta" DROP COLUMN "prazo",
ADD COLUMN     "prazo" TIMESTAMP(3) NOT NULL;
