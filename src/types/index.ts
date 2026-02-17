import { Prisma } from "@prisma/client";
import { StatusConta } from "../utils/status";

export interface CriarContaInput {
    nome: string;
    valor: number;
    categoriaId?: number | null;
    data: string;
    status: StatusConta;
}

export interface PayloadEdicao {
    nome: string;
    valor: number;
    data: string;
    categoriaId?: number | null;
}

export interface ContaLocal {
    id: number; 
    nome: string;
    valor: number;
    categoria?: string;
    categoriaId: number | null;
    data: string;
    status: StatusConta;
    statusAnterior?: string | StatusConta;
}


export interface ContaFromAPI {
    id: number;
    nome: string;
    valor: number;
    data: string;
    status: string;
    userId: number;
    categoriaId: number | null;
    statusAnterior?: string;
    categoria: {
    id: number;
    nome: string;
    tipo: string;
    } | null;
}

export interface Transacao {
    id: number;
    contaId: number;
    nome: string;
    valor: number;
    categoriaId: number;
    data: string;
    tipo: "receita" | "despesa"; 
    status: string;
}


export type TransacaoFromAPI = Prisma.TransacaoGetPayload<{
    include: {
        categoria: true;
        conta: true;
    };
}> & {
    nome?: string;
};

export type TransacaoTipo = "receita" | "despesa";
export type TransacaoStatus = "pendente" | "paga" | "vencida";


export interface TransacaoLocal {
    id: number;
    valor: number;
    tipo: TransacaoTipo;
    data: string;
    status: TransacaoStatus;
    categoria: string;
    categoriaId: number | null;
    contaId: number | null;
    nome: string;
}

export type CategoriaFromAPI = Prisma.CategoriaGetPayload<true>;

export interface CategoriaLocal {
    userId: number | null;
    id:number;
    nome: string;
    tipo: "receita" | "despesa";
}

export interface PeriodoSelecionado  {
    tipo: "predefinido" | "personalizado";
    dias?: number; 
    inicio?: Date;
    fim?: Date;
};

export interface ToastProps {
    id: string;
    message: string;
    type?: "primary" | "success" | "danger" | "warning" | undefined;
    duration?: number;
};

export type OrcamentoFromAPI = Prisma.OrcamentoGetPayload<{ include: { categoria: true } }>;

export interface OrcamentoLocal {
    id: number;
    categoriaId: number;
    valor: number;
}

export type OrcamentoInput = Omit<OrcamentoLocal, "id">;

export type MetaFromAPI = Prisma.MetaGetPayload<true>;

export interface MetaLocal {
    id: number;
    titulo: string;
    categoriaId: number | null;
    valorAlvo: number;  
    valorAtual: number;
    prazo: string;   
}

export type MetaInput = Omit<MetaLocal, "id" | "valorAtual">;

export interface JwtPayload {
    userId: number;
}