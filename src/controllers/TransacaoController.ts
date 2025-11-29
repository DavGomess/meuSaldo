import { Request, Response } from "express";
import { TransacaoService } from "../services/TransacaoService";

const transacaoService = new TransacaoService();

export class TransacaoController {
    async criar(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Usuário não autenticado" });
            }
            const userId = req.user.id;
            const { valor, tipo, data, status, categoriaId, contaId } = req.body;
            
            const transacao = await transacaoService.criar({
                userId,
                valor,
                tipo,
                data,
                status,
                categoriaId,
                contaId
            });
            return res.status(201).json(transacao);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro ao criar transação";
            return res.status(400).json({ message });
        }
    }

    async listar(req: Request, res: Response) {
    try {
        if (!req.user) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

        const userId = req.user.id;
        const transacoes = await transacaoService.listar(userId);
        return res.status(200).json(transacoes);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro ao listar transações";
        return res.status(400).json({ message });
    }
}

    async filtrar(req: Request, res: Response) {
    try {
        if (!req.user) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

        const userId = req.user.id;
        const { termo } = req.query;

        if (!termo || typeof termo !== "string") {
        return res.status(400).json({ message: "Termo de busca inválido" });
    }

        const resultado = await transacaoService.filtrar(userId, termo);
        return res.status(200).json(resultado);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro ao filtrar transações";
        return res.status(400).json({ message });
    }
}
}