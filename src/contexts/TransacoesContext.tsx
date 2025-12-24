"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TransacaoFromAPI, TransacaoLocal } from "../types";
import { useAuth } from "./AuthContext";
import { TransacaoStatus, TransacaoTipo } from "@prisma/client";
import { useCallback } from "react";

interface TransacoesContextType {
    transacoes: TransacaoLocal[];
    syncTransacoes: () => Promise<void>;
    adicionar: (t: TransacaoLocal) => void;
    atualizar: (t: TransacaoLocal) => void;
    remover: (id: number) => void;
}

const TransacoesContext = createContext<TransacoesContextType | undefined>(undefined);

export const TransacoesProvider = ({ children }: { children: ReactNode }) => {
    const [transacoes, setTransacoes] = useState<TransacaoLocal[]>([]);
    const { user } = useAuth();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const adicionar = (nova: TransacaoLocal) => {
        setTransacoes(prev => [...prev, nova]);
    };

    const atualizar = (editada: TransacaoLocal) => {
        setTransacoes(prev => prev.map(t => (t.id === editada.id ? { ...editada } : t)));
    };

    const remover = (id: number) => {
        setTransacoes(prev => prev.filter(t => t.id !== id));
    }

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
}, []);

    useEffect(() => {
        if (user) {
            syncTransacoes();
        }
    }, [syncTransacoes, user]);

    return (
        <TransacoesContext.Provider value={{ transacoes, syncTransacoes, adicionar, atualizar, remover }}>
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