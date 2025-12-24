import { prisma } from "../lib/prisma";
import { OrcamentoFromAPI } from "../types";

export class OrcamentosRepository {
    async criar(data: { categoriaId: number; valor: number; userId: number}): Promise<OrcamentoFromAPI> {
        return prisma.orcamento.upsert({
            where: { userId_categoriaId: { userId: data.userId, categoriaId: data.categoriaId } },
            update: { valor: data.valor },
            create: data,
            include: { categoria: true }
        });
    }

    async listarPorUser(userId: number): Promise<OrcamentoFromAPI[]> {
        return prisma.orcamento.findMany({
            where: { userId },
            include: { categoria: true }
        });
    }

    async deletar(categoriaId: number, userId: number): Promise<void> {
        await prisma.orcamento.deleteMany({
            where: { userId, categoriaId }
        })
    }
}