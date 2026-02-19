import { TransacaoLocal, TransacaoFromAPI, TransacaoTipo, TransacaoStatus } from "../types";
import { TransacaoRepository } from "../repository/TransacaoRepository";
import { StatusConta } from "../utils/status";

export class TransacaoService {
    async criar(data: { userId: number; valor: number; tipo: string; data: string; status: string; categoriaId: number; contaId: number}): Promise<TransacaoLocal> {
        const transacaoCriada = await TransacaoRepository.criar(data);
        return this.formatTransacoes([transacaoCriada])[0];
    }

    async listar(userId: number): Promise<TransacaoLocal[]> {
        const transacoes = await TransacaoRepository.findAllByUser(userId);
        return this.formatTransacoes(transacoes);
    }

    async filtrar(userId: number, search: string): Promise<TransacaoLocal[]> {
        const termo = search.trim().toLowerCase();
        if (!termo) {
            return this.listar(userId);
        }
        
        const transacoes = await TransacaoRepository.filterBySearch(userId, termo);
        return this.formatTransacoes(transacoes);
    }

    private formatTransacoes(transacoes: TransacaoFromAPI[]): TransacaoLocal[] {
        const isStatusValid = (s: string): s is StatusConta => ["pendente", "paga", "vencida"].includes(s);

        return transacoes.map((t) => {
            const status = isStatusValid(t.status) ? t.status : "pendente";

            const nomeConta = t.conta?.nome || "Sem conta";

            return {
                id: t.id,
                valor: t.valor,
                tipo: t.tipo as TransacaoTipo,
                data: t.data.toISOString(),
                status: status as TransacaoStatus,
                categoria: t.categoria?.nome || "Sem categoria",
                categoriaId: t.categoriaId,
                contaId: t.contaId || 0,
                nome: nomeConta
            }
        })
    }
}