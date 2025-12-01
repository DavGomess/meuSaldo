import { prisma } from "@/lib/prisma";
import { MetasRepository } from "@/repository/MetasRepository";
import { MetaFromAPI, MetaInput, MetaLocal } from "@/types";

export class MetasService {
    private repository = new MetasRepository();

    async criar(input: MetaInput, userId: number): Promise<MetaLocal> {
        if (input.categoriaId) {
            const categoria = await prisma.categoria.findFirst({
                where: {
                    id: input.categoriaId,
                    OR: [
                        { userId },      
                        { userId: null }
                    ]
                },
        });

        if (!categoria) {
            throw new Error("Categoria inválida ou não pertence ao usuário");
        }
    }
        const data = await this.repository.criar({
            titulo: input.titulo,
            categoriaId: input.categoriaId,
            valorAlvo: input.valorAlvo,
            prazo: new Date(input.prazo.split("T")[0]),
            userId
        });
        return this.toLocal(data);
    }

    async listar(userId: number): Promise<MetaLocal[]> {
        const metas = await this.repository.listarPorUser(userId);
        return metas.map(this.toLocal);
    }

    async adicionarValor(id: number, valor: number, userId: number): Promise<MetaLocal> {
        const meta = await this.repository.listarPorUser(userId).then(m => m.find(m => m.id === id));
        if (!meta) throw new Error("Meta não encontrada");
        const novoValor = Math.min(meta.valorAtual + valor, meta.valorAlvo);
        const atualizada = await this.repository.atualizarValor(id, novoValor, userId);
        return this.toLocal(atualizada);
    }

    async editar(meta: MetaLocal, userId: number): Promise<MetaLocal> {
        const data = await this.repository.atualizar(
            {
                id: meta.id,
                titulo: meta.titulo,
                categoriaId: meta.categoriaId,
                valorAlvo: meta.valorAlvo,
                valorAtual: meta.valorAtual,
                prazo: new Date(meta.prazo.split("T")[0])
            },
            userId
        );
        return this.toLocal(data);
    }

    async deletar(id: number, userId: number): Promise<void> {
        await this.repository.deletar(id, userId);
    }

    private toLocal(meta: MetaFromAPI): MetaLocal {
        return {
            id: meta.id,
            titulo: meta.titulo,
            categoriaId: meta.categoriaId,
            valorAlvo: Number(meta.valorAlvo),
            valorAtual: Number(meta.valorAtual),
            prazo:  meta.prazo.toISOString().split("T")[0]
        }
    }
}