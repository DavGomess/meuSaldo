/*
  Warnings:

  - You are about to drop the column `valor` on the `Meta` table. All the data in the column will be lost.
  - Added the required column `valorAlvo` to the `Meta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meta" DROP COLUMN "valor",
ADD COLUMN     "valorAlvo" DOUBLE PRECISION NOT NULL;
