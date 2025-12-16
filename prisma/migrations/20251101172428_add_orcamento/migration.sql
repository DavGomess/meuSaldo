-- DropIndex
DROP INDEX "public"."Orcamento_userId_idx";

-- CreateIndex
CREATE INDEX "Orcamento_userId_categoriaId_idx" ON "Orcamento"("userId", "categoriaId");
