import { Router } from "express";
import { TransacaoController } from "../controllers/TransacaoController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const controller = new TransacaoController();

router.use(authenticateToken);

router.get("/", controller.listar.bind(controller));
router.get("/filtrar", controller.filtrar.bind(controller));
router.post("/", controller.criar.bind(controller));

export default router;
