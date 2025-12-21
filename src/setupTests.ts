import { prisma } from "@/lib/prisma";
import { Server } from "http";
import app from "./app";

let server: Server;

beforeAll(async () => {
  const port = 4001 + Math.floor(Math.random() * 1000);
    server = app.listen(port);
    console.log(`Test server rodando na porta ${port}`);
    try {
        await prisma.$connect();
    } catch (e) {
        console.error("⚠️ Falha ao conectar ao banco, ignorando em CI:", e);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
});

afterEach(async () => {

    await prisma.meta.deleteMany();
    await prisma.orcamento.deleteMany();
    await prisma.transacao.deleteMany();
    await prisma.contasPagar.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    if (process.env.CI !== "true") {
        await prisma.$disconnect();
    }
    server.close();
});