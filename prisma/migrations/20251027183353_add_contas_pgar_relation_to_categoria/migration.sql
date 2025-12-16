/*
  Warnings:

  - You are about to drop the column `categoria` on the `ContasPagar` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContasPagar" DROP COLUMN "categoria",
ADD COLUMN     "categoriaId" INTEGER;

-- AddForeignKey
ALTER TABLE "ContasPagar" ADD CONSTRAINT "ContasPagar_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
