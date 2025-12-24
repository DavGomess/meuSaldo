import { CategoriaLocal } from "../types";
import { CategoriasRepository } from "../repository/CategoriasRepository";

export class CategoriasService {
    private repository = new CategoriasRepository();


    async criar(nome: string, tipo: "receita" | "despesa", userId: number): Promise<CategoriaLocal> {
        const categoria = await this.repository.criar(nome, tipo, userId);
        return { 
            id: categoria.id,
            nome: categoria.nome,
            tipo: categoria.tipo as "receita" | "despesa",
            userId: categoria.userId
    }
}

    async listar(userId: number): Promise<{ receita: CategoriaLocal[]; despesa: CategoriaLocal[] }> {
        const categoriasDoBanco = await this.repository.listarPorUser(userId);
        const categoriasLocal: CategoriaLocal[] = categoriasDoBanco.map(c => ({
            id: c.id,
            nome: c.nome,
            tipo: c.tipo as 'receita' | 'despesa',
            userId: c.userId
        }));

        return {
            receita: categoriasLocal.filter(c => c.tipo === "receita"),
            despesa: categoriasLocal.filter(c => c.tipo === "despesa")
        };
}

    async deletar(id: number, userId: number): Promise<void> {
        const categoria = await this.repository.listarPorUser(userId);
        const encontrada = categoria.find(c => c.id === id);

        if (!encontrada || encontrada.userId === null) {
            throw new Error("Categoria fixa não pode ser deletada.");
        }

        await this.repository.deletar(id, userId);
    }


}
