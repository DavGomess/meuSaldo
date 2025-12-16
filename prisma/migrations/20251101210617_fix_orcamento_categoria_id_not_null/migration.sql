/*
  Warnings:

  - Made the column `categoriaId` on table `Orcamento` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Orcamento" DROP CONSTRAINT "Orcamento_categoriaId_fkey";

-- AlterTable
ALTER TABLE "Orcamento" ALTER COLUMN "categoriaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
