/*
  Warnings:

  - A unique constraint covering the columns `[categoriaId,userId]` on the table `Orcamento` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Orcamento_userId_categoriaId_idx";

-- CreateIndex
CREATE INDEX "Orcamento_userId_idx" ON "Orcamento"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_categoriaId_userId_key" ON "Orcamento"("categoriaId", "userId");
