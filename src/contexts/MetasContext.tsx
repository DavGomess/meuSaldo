"use client";

import { MetaFromAPI, MetaLocal } from "../types"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface MetasContextType {
    metas: MetaLocal[];
    adicionarMeta: (meta: Omit<MetaLocal, "id" | "valorAtual">) => Promise<void>;
    adicionarValorMeta: (id: number, valor: number) => Promise<void>;
    editarMeta: (meta: MetaLocal) => Promise<void>;
    removerMeta: (id: number) => Promise<void>;
}

const MetasContext = createContext<MetasContextType | undefined>(undefined);

export const MetasProvider = ({ children }: { children: ReactNode }) => {
    const [metas, setMetas] = useState<MetaLocal[]>([]);
    const { user } = useAuth();

    const sync = async () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            setMetas([]);
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/metas", { headers: { Authorization: `Bearer ${token}` } });

            if (!res.ok) {
                setMetas([]);
                return;
            }

            const metasBackend: MetaFromAPI[] = await res.json();
            const metasLocal: MetaLocal[] = metasBackend.map(meta => ({
                id: meta.id,
                titulo: meta.titulo,
                categoriaId: meta.categoriaId,
                valorAlvo: Number(meta.valorAlvo),
                valorAtual: Number(meta.valorAtual),
                prazo: String(meta.prazo).split("T")[0]
            }));
            setMetas(metasLocal);
        } catch {
            setMetas([]);
        }
    };

    useEffect(() => {
        if (user) {
            sync();
        } else {
            setMetas([]);
        }
    }, [user]);

    const adicionarMeta = async (meta: Omit<MetaLocal, "id" | "valorAtual">) => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) throw new Error("Não autenticado");

        const res = await fetch("http://localhost:4000/metas", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(meta),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || "Erro ao criar meta");
        }
        await sync();
    };

    const adicionarValorMeta = async (id: number, valor: number) => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) throw new Error("Não autenticado");

        const res = await fetch(`${"http://localhost:4000/metas"}/${id}/valor`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ valor }),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || "Erro ao adicionar valor");
        }
        await sync();
    }

    const editarMeta = async (meta: MetaLocal) => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) throw new Error("Não autenticado");
        const res = await fetch("http://localhost:4000/metas", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(meta),
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || "Erro ao editar meta");
        }
        await sync();
    };

    const removerMeta = async (id: number) => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) throw new Error("Não autenticado");

        const res = await fetch(`${"http://localhost:4000/metas"}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || "Erro ao deletar meta");
        }
        await sync();
    };

    return (
        <MetasContext.Provider value={{ metas, adicionarMeta, removerMeta, adicionarValorMeta, editarMeta }}>
            {children}
        </MetasContext.Provider>
    );
};

export function useMetas() {
    const context = useContext(MetasContext);
    if (!context) throw new Error("useMetas deve ser usado dentro de MetasProvider");
    return context;
}