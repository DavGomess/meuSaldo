/*
  Warnings:

  - A unique constraint covering the columns `[nome,userId]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransacaoTipo" AS ENUM ('receita', 'despesa');

-- CreateEnum
CREATE TYPE "TransacaoStatus" AS ENUM ('pendente', 'paga', 'vencida');

-- DropIndex
DROP INDEX "public"."Categoria_userId_idx";

-- AlterTable
ALTER TABLE "Transacao" ADD COLUMN     "contaId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_userId_key" ON "Categoria"("nome", "userId");

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "ContasPagar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
