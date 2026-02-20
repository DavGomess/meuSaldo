"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TransacaoFromAPI, TransacaoLocal } from "../types";
import { useAuth } from "./AuthContext";
import { TransacaoStatus, TransacaoTipo } from "@prisma/client";
import { useCallback } from "react";

interface TransacoesContextType {
    transacoes: TransacaoLocal[];
    syncTransacoes: () => Promise<void>;
    adicionarOtimitica: (nova: Partial<TransacaoLocal>) => number;
    atualizarOtimitica: (id: number, updates: Partial<TransacaoLocal>) => void;
    removerOtimitica: (id: number) => void;
}

const TransacoesContext = createContext<TransacoesContextType | undefined>(undefined);

export const TransacoesProvider = ({ children }: { children: ReactNode }) => {
    const [transacoes, setTransacoes] = useState<TransacaoLocal[]>([]);
    const { user } = useAuth();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const adicionarOtimitica = (nova: Partial<TransacaoLocal>) => {
        const tempId = -Date.now();
        const otimistica: TransacaoLocal = {
            id: tempId,
            valor: nova.valor ?? 0,
            categoriaId: nova.categoriaId ?? null,
            data: nova.data ?? new Date().toISOString(),
            tipo: nova.tipo ?? "despesa",
            status: nova.status ?? "pendente",
            categoria: nova.categoria ?? "",
            contaId: nova.contaId ?? null,
            nome: nova.nome ?? "Transação otimista"
        };
        setTransacoes(prev => [...prev, otimistica]);
        return tempId;
    };

    const atualizarOtimitica = (id: number, updates: Partial<TransacaoLocal>) => {
        setTransacoes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const removerOtimitica = (id: number) => {
        setTransacoes(prev => prev.filter(t => t.id !== id));
    };

    const syncTransacoes = useCallback(async () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            setTransacoes([]);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/transacoes`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store"
            });

            const json = await res.json();

            if (!Array.isArray(json)) {
                setTransacoes([]);
                return;
            }

            const formatadas: TransacaoLocal[] = json.map((t: TransacaoFromAPI) => ({
                id: t.id,
                valor: Number(t.valor),
                categoriaId: t.categoriaId ?? null,
                data: new Date(t.data).toISOString(),
                tipo: t.tipo as TransacaoTipo,
                status: t.status as TransacaoStatus,
                categoria: typeof t.categoria === "string" ? t.categoria : t.categoria?.nome ?? "",
                contaId: t.contaId ?? null,
                nome: t.nome ?? t.conta?.nome ?? "Sem descrição"

            }))
            setTransacoes(formatadas)
        } catch {
            setTransacoes([]);
        }
    }, [API_URL]);

    useEffect(() => {
        if (user) {
            syncTransacoes();
        }
    }, [syncTransacoes, user]);

    return (
        <TransacoesContext.Provider value={{ transacoes, syncTransacoes, adicionarOtimitica, atualizarOtimitica, removerOtimitica }}>
            {children}
        </TransacoesContext.Provider>
    );
};

export function useTransacoes() {
    const context = useContext(TransacoesContext);
    if (!context) {
        throw new Error("useTransacoes deve ser usado dentro de TransacoesProvider");
    }
    return context;
}