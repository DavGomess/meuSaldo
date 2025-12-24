import { AuthService } from "../services/AuthService";
import { Request, Response } from "express";

export class ResetPasswordController {
    static async requestReset(req: Request, res: Response) {
        const { email } = req.body;
        try {
            const result = await AuthService.requestPasswordReset(email);
            res.json(result);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro inesperado";
            const status = msg.includes("não encontrado") ? 404 : 400;
            res.status(status).json({ error: msg });
        }
    }

    static async reset(req: Request, res: Response) {
        const { token, password } = req.body;
        try {
            const result = await AuthService.resetPassword(token, password);
            res.json(result);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao redefinir senha";
            const status = msg.includes("Token") ? 401 : 400;
            res.status(status).json({ error: msg });
        }
    }
}