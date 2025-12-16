-- DropForeignKey
ALTER TABLE "public"."Categoria" DROP CONSTRAINT "Categoria_userId_fkey";

-- AlterTable
ALTER TABLE "Categoria" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ContasPagar" ALTER COLUMN "data" SET DATA TYPE DATE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
