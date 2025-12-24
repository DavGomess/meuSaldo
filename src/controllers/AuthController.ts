import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
    async register(req: Request, res: Response) {
    try {
        const user = await AuthService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao registrar";
        res.status(400).json({ error: message });
    }
}

    async login(req: Request, res: Response) {
    try {
        const {token, user } = await AuthService.login(req.body);
        res.status(200).json({ token, user });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(401).json({ message });
    }
}
}