import { Request, Response } from "express";
import { ContasService } from "../services/ContasPagarService";

export class ContasPagarController {
    private contasService = new ContasService();

    
    async criar(req: Request, res: Response) {
        try {
            const { nome, valor, categoriaId, data } = req.body;
            const userId = req.user!.id;

        const conta = await this.contasService.criarContaService({
            nome,
            valor: Number(valor),
            categoriaId: categoriaId != null ? Number(categoriaId) : null,
            data,
            status: "pendente",
        },
        userId
    );

        return res.status(201).json(conta);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta";
            return res.status(400).json({ error: errorMessage });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const userId = req.user!.id;

            const contas = await this.contasService.listarContasService(userId);
            return res.json(contas);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(500).json({ error: errorMessage });
    }
    }

    async editar(req: Request, res: Response) {
    try {
        const userId = req.user!.id

        const conta = await this.contasService.editarContaService(Number(req.params.id), req.body, userId);
        return res.json(conta);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ error: errorMessage });
    }
}

    async deletar(req: Request, res: Response) {
        try {
            const userId = req.user!.id;

            await this.contasService.deleteContaService(Number(req.params.id), userId);
            return res.status(204).send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(400).json({ error: errorMessage });
        }
    }
}