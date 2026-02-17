import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { prisma } from "../lib/prisma";
import { ResetPasswordController } from "../controllers/ResetPasswordController";
import { validateBody } from "../middlewares/validateBody";
import { registerSchema, loginSchema, resetPasswordSchema, confirmResetPasswordSchema } from "../schemas";

const router = Router();
const authController = new AuthController();

router.post("/register", validateBody(registerSchema), (req, res) => authController.register(req, res));
router.post("/login", validateBody(loginSchema), (req, res) => authController.login(req, res));
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ id: user.id, email: user.email });
});
router.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logout realizado com sucesso" });
});
router.post("/reset-password", validateBody(resetPasswordSchema), ResetPasswordController.requestReset);
router.post("/reset-password/confirm", validateBody(confirmResetPasswordSchema), ResetPasswordController.reset);

export default router;