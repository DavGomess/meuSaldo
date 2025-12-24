import { OrcamentosSerivice } from "../services/OrcamentosService";
import { Request, Response } from "express";

const service = new OrcamentosSerivice();

export class OrcamentosController {
    async upsert(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { categoriaId, valor } = req.body;

            const { orcamento, isCreated } = await service.upsert(
            { categoriaId, valor },
            userId
        );

        const status = isCreated ? 201 : 200;
        return res.status(status).json(orcamento);
        
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao salvar orçamento";
            return res.status(400).json({ error: msg });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { categoriaId, valor } = req.body;

            const orcamento = await service.update(categoriaId, valor, userId);

            return res.status(200).json(orcamento);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao atualizar orçamento";
            return res.status(400).json({ error: msg });
        }
}

    async listar(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const orcamentos = await service.listar(userId);
            return res.json(orcamentos);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao listar orçamento";
            return res.status(500).json({ error: msg });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { categoriaId } = req.params;
            await service.remover(Number(categoriaId), userId);
            return res.status(204).send();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao deletar orçamento";
            return res.status(400).json({ error: msg });
        }
    }
}
