import { prisma } from "../lib/prisma";
import { CategoriaFromAPI } from "../types";

export class CategoriasRepository {
    async criar(nome: string, tipo: "receita" | "despesa", userId: number): Promise<CategoriaFromAPI> {
        return prisma.categoria.create({
            data: { nome, tipo, userId }
        });
    }

    async listarPorUser(userId: number): Promise<CategoriaFromAPI[]> {
        return prisma.categoria.findMany({
        where: {
            OR: [
                { userId: userId },     
                { userId: null }   
            ]
        },
        orderBy: { nome: "asc" }
    });
    }

    async deletar(id: number, userId: number): Promise<void> {
        await prisma.categoria.deleteMany({
            where: { id, userId }
        });
    }
}

