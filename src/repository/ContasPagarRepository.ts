import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma"
import { CriarContaInput } from "../types";

export const criarConta = (dados: CriarContaInput, userId: number) => {
    const data: Prisma.ContasPagarCreateInput = {
        nome: dados.nome,
        valor: dados.valor,
        data: new Date(dados.data),
        status: dados.status,
        user: {
            create: undefined,
            connectOrCreate: undefined,
            connect: undefined
        }
    };

    if (userId) {
        data.user = { connect: { id: userId } };
    }

    if (dados.categoriaId != null) {
        data.categoria = { connect: { id: dados.categoriaId } };
    }

    return prisma.contasPagar.create({
        data,
        include: { categoria: true }
    });
}

export const listarConta = (userId: number) => {
    return prisma.contasPagar.findMany({
        where: { userId },
        include: { categoria: true }
    });
}

export const editarConta = async (id: number, dados: Partial<CriarContaInput>, userId: number) => {
    const dataToUpdate: Prisma.ContasPagarUpdateInput = {}

    if (dados.nome !== undefined) dataToUpdate.nome = dados.nome;
    if (dados.valor !== undefined) dataToUpdate.valor = dados.valor;
    if (dados.data !== undefined) dataToUpdate.data = new Date(dados.data);

    if (dados.categoriaId !== undefined) {
        if (dados.categoriaId === null || dados.categoriaId === 0) {
            dataToUpdate.categoria = { disconnect: true };
        } else {
            dataToUpdate.categoria = { connect: { id: dados.categoriaId } };
        }
    }


    await prisma.contasPagar.update({
        where: { id, userId },
        data: dataToUpdate,
    });

    return await prisma.contasPagar.findUnique({
        where: { id },
        include: { categoria: true },
    });
};

export const deleteConta = (id: number, userId: number) => {
    return prisma.contasPagar.deleteMany({
        where: { id, userId }
    })
}

