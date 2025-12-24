import { prisma } from "../lib/prisma";
import { OrcamentosRepository } from "../repository/OrcamentosRepository";
import { OrcamentoFromAPI, OrcamentoInput, OrcamentoLocal } from "../types";

export class OrcamentosSerivice {
    private repository = new OrcamentosRepository();

    async upsert(input: OrcamentoInput, userId: number): Promise<{ orcamento: OrcamentoLocal; isCreated: boolean }> {
        const { categoriaId, valor } = input;

        if (!categoriaId || !valor || valor <= 0) {
            throw new Error("Categoria e valor positivo são obrigatórios.");
        }
        
        const orcamentoExistente = await prisma.orcamento.findFirst({
            where: { userId }
        });

        if (orcamentoExistente) {
            throw new Error("Você já possui um orçamento ativo. Remova-o antes de criar outro.");
        }

        const categoria = await prisma.categoria.findFirst({
            where: {
                id: categoriaId,
                OR: [
                    { userId: userId },
                    { userId: null } 
                ]
    }
        });
        if (!categoria) {
            throw new Error("Categoria não encontrada.");
        }

        const data = await prisma.orcamento.create({
            data: { userId, categoriaId, valor },
            include: { categoria: true }
        });

        return {
            orcamento: this.toLocal(data),
            isCreated: true
        };  
    }

    async update(categoriaId: number, valor: number, userId: number): Promise<OrcamentoLocal> {
    const orcamento = await prisma.orcamento.findFirst({
        where: { userId }
    });

    if (!orcamento) throw new Error("Orçamento não encontrado.");

    const updated = await prisma.orcamento.update({
        where: { id: orcamento.id },
        data: { categoriaId, valor },
        include: { categoria: true }
    });

    return this.toLocal(updated);
}

    async listar(userId: number): Promise<OrcamentoLocal[]> {
        const orcamentos = await this.repository.listarPorUser(userId);
        return orcamentos.map(this.toLocal);
    }

    async remover(categoriaId: number, userId: number): Promise<void> {
        await this.repository.deletar(categoriaId, userId);
    }

    private toLocal(o: OrcamentoFromAPI): OrcamentoLocal {
        return {
            id: o.id,
            categoriaId: o.categoriaId,
            valor: Number(o.valor)
        }
    }
}