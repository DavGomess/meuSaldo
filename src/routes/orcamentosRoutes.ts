import { OrcamentosController } from "@/controllers/OrcamentosController";
import { authenticateToken } from "@/middlewares/authMiddleware";
import { Router } from "express";
import { validateBody } from "@/middlewares/validateBody";
import { createOrcamentoSchema } from "@/schemas";

const router = Router();
const orcamentosController = new OrcamentosController();

router.use(authenticateToken);

router.post("/", validateBody(createOrcamentoSchema), orcamentosController.upsert.bind(orcamentosController));
router.get("/", orcamentosController.listar.bind(orcamentosController));
router.put("/", orcamentosController.update.bind(orcamentosController));
router.delete("/:categoriaId", orcamentosController.deletar.bind(orcamentosController));

export default router;