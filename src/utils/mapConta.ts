import { ContaFromAPI, ContaLocal } from "@/types";
import { StatusConta } from "./status";

export function mapContaFromAPI( conta: ContaFromAPI, categorias: { id: number; nome: string }[]): ContaLocal {
    return {
    id: conta.id,
    nome: conta.nome,
    valor: conta.valor,
    data: conta.data,
    status: conta.status as StatusConta,
    statusAnterior: conta.statusAnterior as StatusConta | undefined,
    categoriaId: conta.categoriaId,
    categoria:
    conta.categoria?.nome || categorias.find(c => c.id === conta.categoriaId)?.nome || "Sem categoria",};
}
