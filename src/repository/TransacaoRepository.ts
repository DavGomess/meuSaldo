import { prisma } from "../lib/prisma";
import { TransacaoFromAPI } from "../types";

export const TransacaoRepository = {
    async criar(data: { userId: number; valor: number; tipo: string; data: string; status: string; categoriaId: number; contaId: number}) {
        return await prisma.transacao.create({
            data: {
                valor: data.valor,
                tipo: data.tipo,
                data: new Date(data.data),
                status: data.status,
                categoriaId: data.categoriaId,
                userId: data.userId,
                contaId: data.contaId
            },
            include: { categoria: true, conta: true }
        })
    },

    async findAllByUser(userId: number): Promise<TransacaoFromAPI[]> {
        return prisma.transacao.findMany({
            where: { userId },
            include: { categoria: true, conta: true },
            orderBy: { data: "desc" }
        });
    },
    
    async filterBySearch(userId: number, search: string): Promise<TransacaoFromAPI[]> {
    return prisma.transacao.findMany({
        where: {
        userId,
        OR: [
            { 
                conta: {
                    nome: { contains: search, mode: "insensitive" },
                    userId: userId
                }
            },
            { 
                categoria: {
                    nome: { contains: search, mode: "insensitive" },
                    userId: userId
                }
            }
        ]
        },
        include: { categoria: true, conta: true },
        orderBy: { data: "desc" },
    });
},
}