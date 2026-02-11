import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendResetPasswordEmail } from "../lib/sendResetPasswordEmail";
import { JwtPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET as string;

export class AuthService {
    static async register({ email, password }: { email: string; password: string }) {
    if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios");
    }
    if (!email.includes("@")) {
        throw new Error("E-mail inválido");
    }
    if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("E-mail já cadastrado");

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashed },
    });

    return { id: user.id, email: user.email };
}

    static async login(data: { email: string; password: string }) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Email ou senha incorretos");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Email ou senha incorretos");

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return {token, user: { id: user.id, email: user.email }}
}

    static async requestPasswordReset(email: string) {
    if (!email) {
        return { message: "Se o e-mail existir, um link será enviado" };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        const token = jwt.sign({ userId: user.id }, JWT_RESET_SECRET, { expiresIn: "15m" });
        await prisma.user.update({ where: { id: user.id }, data: { resetPasswordToken: token, resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000) }});

        const resetLink = token;
        
        await sendResetPasswordEmail(email, resetLink);
    }

    return { message: "Se o e-mail existir, um link será enviado" };
}

    static async resetPassword(token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
        throw new Error("A nova senha deve ter pelo menos 6 caracteres");
    }

    let payload: JwtPayload;
    try {
        payload = jwt.verify(token, JWT_RESET_SECRET) as JwtPayload;
    } catch {
        throw new Error("Token inválido ou expirado");
    }

    const user = await prisma.user.findFirst({
        where: {
            id: payload.userId,
            resetPasswordToken: token,
            resetPasswordExpires: {
                gt: new Date()
            }
        }
    });

    if (!user) {
        throw new Error("Token inválido ou já utilizado");
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: { 
            password: hashed,
            resetPasswordToken: null,
            resetPasswordExpires: null
        },
    });

    return { message: "Senha redefinida com sucesso" };
    }
}