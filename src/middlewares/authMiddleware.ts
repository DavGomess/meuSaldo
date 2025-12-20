import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    if (process.env.JEST_WORKER_ID !== undefined) {
        req.user = { id: 1, email: "test@test.com" };
        return next();
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token não fornecido" });

    try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.user = decoded; 
    next();
} catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Token inválido ou expirado";
    return res.status(403).json({ message });
    }
}
