import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function authenticateToken(req: Request, res: Response, next: NextFunction) {

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
