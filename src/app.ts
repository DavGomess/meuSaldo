import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import categoriaRoutes from "./routes/categoriasRoutes";
import contasPagarRoutes from "./routes/contasPagarRoutes";
import transacaoRoutes from "./routes/transacaoRoutes";
import orcamentoRoutes from "./routes/orcamentosRoutes";
import metasRoutes from "./routes/metasRoutes"

dotenv.config();

const app = express();


app.use(express.json());
app.use(cors({  origin: [ "http://localhost:3000", "https://meusaldo-finance.vercel.app" ],
    methods: ["GET", "POST", "PUT", "DELETE"],
}));


app.use("/auth", authRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/contasPagar", contasPagarRoutes);
app.use("/transacoes", transacaoRoutes);
app.use("/orcamentos", orcamentoRoutes);
app.use("/metas", metasRoutes)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erro interno do servidor" });
});

export default app;