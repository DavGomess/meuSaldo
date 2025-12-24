import { MetasController } from "../controllers/MetasController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { Router } from "express";
import { validateBody } from "../middlewares/validateBody";
import { createMetaSchema, adicionarValorSchema, editarMetaSchema } from "../schemas";

const router = Router();
const metasController = new MetasController();

router.use(authenticateToken);

router.post("/", validateBody(createMetaSchema), metasController.criar.bind(metasController));
router.get("/", metasController.listar.bind(metasController));
router.post("/:id/valor", validateBody(adicionarValorSchema), metasController.adicionarValor.bind(metasController));
router.put("/", validateBody(editarMetaSchema), metasController.editar.bind(metasController));
router.delete("/:id", metasController.deletar.bind(metasController));

export default router;