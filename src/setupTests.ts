import { prisma } from "@/lib/prisma";
import { Server } from "http";
import app from "./app";

let server: Server  ;

beforeAll(async () => {
  const port = 4001 + Math.floor(Math.random() * 1000);
    server = app.listen(port);
    console.log(`Test server rodando na porta ${port}`);
    await prisma.$connect();
    await new Promise((resolve) => setTimeout(resolve, 500));
});

afterEach(async () => {
    try {
        await prisma.$transaction([
            prisma.meta.deleteMany(),
            prisma.orcamento.deleteMany(),
            prisma.transacao.deleteMany(),
            prisma.contasPagar.deleteMany(),
            prisma.categoria.deleteMany(),
            prisma.user.deleteMany(),
        ]);
    } catch (error) {
        console.warn("Aviso: Falha ao limpar banco no afterEach (normal em CI)", error);
    }
});

afterAll(async () => {
    await prisma.$disconnect();
    server.close();
});