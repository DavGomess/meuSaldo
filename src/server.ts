import app from "./app";
import { prisma } from "./lib/prisma";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first")

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
    console.log("Fechando servidor...");
    await prisma.$disconnect();
    server.close();
});