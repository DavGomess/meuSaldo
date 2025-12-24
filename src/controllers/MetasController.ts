import { Request, Response } from "express";
import { MetasService } from "../services/MetasService";

const service = new MetasService();

export class MetasController {
    async criar(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado" });
            const meta = await service.criar(req.body, req.user.id);
            return res.status(201).json(meta);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Erro desconhecido";
            return res.status(400).json({ error: message });
}
    }

    async listar(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado" });
            const metas = await service.listar(req.user.id);
            return res.json(metas);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Erro desconhecido";
            return res.status(400).json({ error: message });
}
    }

    async adicionarValor(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado" });
            const { id } = req.params;
            const { valor } = req.body;
            const meta = await service.adicionarValor(Number(id), valor, req.user.id);
            return res.json(meta);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Erro desconhecido";
            return res.status(400).json({ error: message });
}
    }

    async editar(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado" });
            const meta = await service.editar(req.body, req.user.id);
            return res.json(meta);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Erro desconhecido";
            return res.status(400).json({ error: message });
}
    }

    async deletar(req: Request, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado" });
            const { id } = req.params;
            await service.deletar(Number(id), req.user.id);
            return res.status(204).send();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Erro desconhecido";
            return res.status(400).json({ error: message });
}
    }
}

