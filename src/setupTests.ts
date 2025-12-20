import { prisma } from "@/lib/prisma";
import { Server } from "http";
import app from "./app";

let server: Server  ;

beforeAll(async () => {
  const port = 4001 + Math.floor(Math.random() * 1000);
    server = app.listen(port);
    console.log(`Test server rodando na porta ${port}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
});

afterEach(async () => {

    await prisma.meta.deleteMany();
    await prisma.orcamento.deleteMany();
    await prisma.transacao.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.contasPagar.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    if (!process.env.CI) {
        await prisma.$disconnect();
    }
    server.close();
});