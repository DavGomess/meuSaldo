import request from "supertest";
import app from "../app";


describe("Resetar senha", () => {
    beforeAll(async () => {
        await request(app)
            .post("/auth/register")
            .send({ email: "reset@test.com", password: "123456" });
    });

    it("POST /auth/reset-password → envia email", async () => {
        const res = await request(app)
            .post("/auth/reset-password")
            .send({ email: "reset@test.com" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Se o e-mail existir, um link será enviado");
    })

    it("POST /auth/reset-password → 400 se email inválido", async () => {
        const res = await request(app)
            .post("/auth/reset-password")
            .send({ email: "email-invalido" });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContainEqual(
        expect.objectContaining({ field: "email" })
        );
    });
})