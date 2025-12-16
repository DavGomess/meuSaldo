/*
  Warnings:

  - A unique constraint covering the columns `[userId,categoriaId]` on the table `Orcamento` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Orcamento_categoriaId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_userId_categoriaId_key" ON "Orcamento"("userId", "categoriaId");
