import { listarConta, editarConta, deleteConta } from "../repository/ContasPagarRepository";
import { definirStatus } from "../utils/status";
import { CriarContaInput } from  "../types"
import { prisma } from "../lib/prisma";


export class ContasService {
    async criarContaService(dados: CriarContaInput, userId: number) {
        if (!dados.categoriaId) {
            throw new Error("Categoria é obrigatória");
        }
        
        const status = definirStatus(dados.data);
        return prisma.$transaction(async (tx) => {
        const conta = await tx.contasPagar.create({
            data: {
                nome: dados.nome,
                valor: dados.valor,
                data: new Date(dados.data),
                status,
                user: { connect: { id: userId } },
                categoria: dados.categoriaId ? { connect: { id: dados.categoriaId } } : undefined,
            },
            include: { categoria: true },
        });

        const tipo = conta.categoria?.tipo || 'despesa';
        await tx.transacao.create({
            data: {
                valor: conta.valor,
                tipo,
                data: conta.data,
                status: conta.status,
                user: { connect: { id: userId } },
                categoria: conta.categoriaId ? { connect: { id: conta.categoriaId } } : undefined,
                conta: { connect: { id: conta.id } },
            },
            include: { categoria: true, conta: true }, 
        });

        return conta; 
    });
}

    async listarContasService(userId: number) {
        return listarConta(userId);
    };

    async editarContaService(id: number, dados: Partial<CriarContaInput>, userId: number) {
        if (dados.valor && dados.valor <= 0) {
        throw new Error("O valor deve ser positivo");
    }

    const contaAtualizada = await editarConta(id, dados, userId);

    if (!contaAtualizada) {
        throw new Error("Conta não encontrada ou sem permissão para editar");
    }

    let tipo: "receita" | "despesa" |undefined;

    if (contaAtualizada.categoriaId) {
        const categoria = await prisma.categoria.findUnique({
            where: { id: contaAtualizada.categoriaId }
        });
        tipo = categoria?.tipo as "receita" | "despesa";
    }

    await prisma.transacao.updateMany({
        where: { contaId: contaAtualizada.id, userId  },
        data: {
            valor: contaAtualizada.valor,
            data: contaAtualizada.data,
            categoriaId: contaAtualizada.categoriaId,
            ...(tipo && { tipo })
        }
    });
    return contaAtualizada;
}

    async deleteContaService(id: number, userId: number) {
        const result = await deleteConta(id, userId);
    if (result.count === 0) {
        throw new Error("Conta não encontrada ou sem permissão para deletar");
    }
        return { success: true };
    }
}

