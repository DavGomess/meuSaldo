import { z } from "zod";

const dateSchema = z.string().refine(
    (val) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(val)) return false;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date.getFullYear() >= 2000;
    },
    { message: "Data inválida (ex: 2025-13-01)" }
);

export const registerSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(1, "Senha obrigatória"),
});

export const resetPasswordSchema = z.object({
    email: z.string().email("E-mail inválido"),
});

export const createCategoriaSchema = z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    tipo: z.enum(["despesa", "receita"], { message: "Tipo deve ser 'despesa' ou 'receita'" }),
});

export const createContaPagarSchema = z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    valor: z.number().positive("Valor deve ser positivo"),
    data: dateSchema,
    categoriaId: z.number().int().nullable().optional()
});

export const createOrcamentoSchema = z.object({
    categoriaId: z.number().int("categoriaId deve ser um número inteiro"),
    valor: z.number().positive("Valor do orçamento deve ser maior que 0"),
});

export const createMetaSchema = z.object({
    titulo: z.string().min(2, "Nome da meta deve ter pelo menos 2 caracteres"),
    valorAlvo: z.number().positive("Valor alvo deve ser maior que 0"),
    prazo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
    categoriaId: z.number().int("categoriaId inválido"),
});

export const adicionarValorSchema = z.object({
    valor: z.number().positive("Valor adicionado deve ser maior que 0"),
});

export const editarMetaSchema = z.object({
    id: z.number().int("ID da meta é obrigatório"),
    nome: z.string().min(2).optional(),
    valorAlvo: z.number().positive().optional(),
    prazo: dateSchema.optional(),
    categoriaId: z.number().int().optional(),
});