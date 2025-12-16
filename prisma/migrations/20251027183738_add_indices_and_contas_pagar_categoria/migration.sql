-- CreateIndex
CREATE INDEX "Categoria_userId_idx" ON "Categoria"("userId");

-- CreateIndex
CREATE INDEX "ContasPagar_userId_idx" ON "ContasPagar"("userId");

-- CreateIndex
CREATE INDEX "Meta_userId_idx" ON "Meta"("userId");

-- CreateIndex
CREATE INDEX "Orcamento_userId_idx" ON "Orcamento"("userId");

-- CreateIndex
CREATE INDEX "Transacao_userId_idx" ON "Transacao"("userId");
