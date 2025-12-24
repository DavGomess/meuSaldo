import { Router } from "express";
import { CategoriasController } from "../controllers/CategoriasController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { createCategoriaSchema } from "../schemas";

const router = Router();
const categoriasController = new CategoriasController()

router.use(authenticateToken);

router.post("/", validateBody(createCategoriaSchema), categoriasController.criar.bind(categoriasController));
router.get("/", categoriasController.listar.bind(categoriasController));
router.delete("/:id", categoriasController.deletar.bind(categoriasController));

export default router;